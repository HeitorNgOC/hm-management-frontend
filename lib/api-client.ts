import axios from "axios"
import { getAuthToken, getRefreshToken, isTokenExpired, storeTokens, clearTokens } from "@/lib/utils/token"

// Base API URL - will be configured via environment variable
const API_BASE_URL = "http://localhost:4000"

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

async function refreshAuthToken(refreshToken: string): Promise<string> {
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
    },
  )
  return response.data.data.token
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
            const newToken = await refreshAuthToken(refreshToken)

            // Store new token
            storeTokens(newToken)

            // Update the current request with new token
            config.headers.Authorization = `Bearer ${newToken}`

            // Notify all waiting requests
            onTokenRefreshed(newToken)

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
          // No refresh token available, redirect to login
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
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()

      if (refreshToken && !isRefreshing) {
        isRefreshing = true

        try {
          const newToken = await refreshAuthToken(refreshToken)

          // Store new token
          storeTokens(newToken)

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          // No tenant header required anymore

          // Notify all waiting requests
          onTokenRefreshed(newToken)

          isRefreshing = false

          // Retry the original request
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          console.error("[v0] Token refresh failed on 401:", refreshError)
          isRefreshing = false
          clearTokens()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
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
        // No refresh token, redirect to login
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

    return Promise.reject(error)
  },
)
