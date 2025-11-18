import axios from "axios"
import { getAuthToken, getRefreshToken, isTokenExpired, storeTokens, clearTokens } from "@/lib/utils/token"

// Base API URL - can be overridden via env var (NEXT_PUBLIC_API_BASE_URL).
// Default to '/api' so that a frontend proxy (see next.config.mjs rewrites)
// can forward calls to the backend and avoid CORS during development.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

// Subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

// Notify all subscribers when token is refreshed
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

async function refreshAuthToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
    },
  )

  // Support both shapes: { data: { token, refreshToken } } (envelope)
  // and { token, refreshToken } (raw). The caller expects an object with token and optional refreshToken.
  const payload = response?.data?.data ?? response?.data

  // Debug: log refresh payload (remove in production)
  try {
    // eslint-disable-next-line no-console
    console.debug("[api-client] refresh response payload:", payload)
  } catch (e) {}

  return { token: payload?.token, refreshToken: payload?.refreshToken }
}

// Request interceptor to add auth token and handle token refresh
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token check for auth endpoints
    if (config.url?.includes("/auth/login") || config.url?.includes("/auth/register")) {
      return config
    }

  const token = getAuthToken()

    if (token) {
      // Check if token is expired or about to expire
      if (isTokenExpired(token)) {
        const refreshToken = getRefreshToken()

        if (refreshToken && !isRefreshing) {
          isRefreshing = true

          try {
            const refreshed = await refreshAuthToken(refreshToken)

            // Store new tokens (if refreshToken was rotated, store it too)
            storeTokens(refreshed.token, refreshed.refreshToken)

            // Debug: confirm tokens stored
            try {
              // eslint-disable-next-line no-console
              console.debug("[api-client] tokens stored, auth_token present:", !!localStorage.getItem("auth_token"))
            } catch (e) {}

            // Update the current request with new token
            config.headers.Authorization = `Bearer ${refreshed.token}`

            // Notify all waiting requests
            onTokenRefreshed(refreshed.token)

            isRefreshing = false
            return config
          } catch (error) {
            // Refresh failed, clear tokens and redirect to login
            console.error("[v0] Token refresh failed:", error)
            isRefreshing = false
            clearTokens()
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
            return Promise.reject(error)
          }
        } else if (isRefreshing) {
          // Wait for the token to be refreshed
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              config.headers.Authorization = `Bearer ${newToken}`
              resolve(config)
            })
          })
        } else {
          // No refresh token available
          // If we still have an access token on the request, it's likely the
          // user hit a route they aren't authorized for — don't clear session;
          // navigate to the unauthorized page so user stays logged in.
          isRefreshing = false
          if (token) {
            if (typeof window !== "undefined") {
              window.location.href = "/unauthorized"
            }
            return Promise.reject(new Error("No refresh token available"))
          }

          // Otherwise, clear tokens and force login as before
          clearTokens()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
          return Promise.reject(new Error("No refresh token available"))
        }
      }

      // Token is valid, add it to the request
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
// Normalize successful responses: unwrap envelope { success, data, error } -> keep inner data
apiClient.interceptors.response.use(
  (response) => {
    try {
      if (response && response.data && typeof response.data === "object" && Object.prototype.hasOwnProperty.call(response.data, "data")) {
        // Replace response.data with inner payload for convenience in services
        response.data = response.data.data
      }
    } catch (e) {
      // ignore and return original response
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()

      if (refreshToken && !isRefreshing) {
        isRefreshing = true

        try {
          const refreshed = await refreshAuthToken(refreshToken)

          // Store new tokens
          storeTokens(refreshed.token, refreshed.refreshToken)

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshed.token}`
          // Debug: show header used for retry
          try {
            // eslint-disable-next-line no-console
            console.debug("[api-client] retrying originalRequest with Authorization:", originalRequest.headers.Authorization)
          } catch (e) {}
          // No tenant header required anymore

          // Notify all waiting requests
          onTokenRefreshed(refreshed.token)

          isRefreshing = false

          // Retry the original request
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed. Decide whether to log the user out or show
          // unauthorized depending on error status. If refresh token is
          // invalid (401) then clear session and go to login. If refresh
          // was rejected with 403 or other statuses, treat as insufficient
          // permissions and navigate to unauthorized without clearing tokens.
          console.error("[v0] Token refresh failed on 401:", refreshError)
          isRefreshing = false
          const refreshStatus = (refreshError as any)?.response?.status

          if (refreshStatus === 401) {
            // Refresh token invalid — force login
            clearTokens()
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
            return Promise.reject(refreshError)
          }

          // Other failures: show unauthorized page but keep session
          if (typeof window !== "undefined") {
            window.location.href = "/unauthorized"
          }
          return Promise.reject(refreshError)
        }
      } else if (isRefreshing) {
        // Wait for the token to be refreshed
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          })
        })
      } else {
        // No refresh token. If the original request carried an access token
        // then prefer showing the unauthorized page (don't clear session).
        isRefreshing = false
        if (originalRequest.headers?.Authorization) {
          if (typeof window !== "undefined") {
            window.location.href = "/unauthorized"
          }
          return Promise.reject(error)
        }

        // Otherwise clear tokens and redirect to login as fallback
        clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized"
      }
    }

    // For non-auth related errors (validation, bad request, etc.), resolve the promise
    // with the error response so callers can inspect `response.data` instead of catching.
    // This follows the project's pattern where services prefer to receive an object
    // with `error`/`success` rather than letting Axios throw and break the flow.
    if (error.response) {
      return Promise.resolve(error.response)
    }

    return Promise.reject(error)
  },
)
