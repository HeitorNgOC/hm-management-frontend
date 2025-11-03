import type { TokenPayload } from "@/lib/types/auth"

/**
 * Decode JWT token without verification
 * Note: This is for client-side use only. Server should verify tokens properly.
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload) as TokenPayload
  } catch (error) {
    console.error("[v0] Error decoding token:", error)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  // Check if token expires in the next 5 minutes (300 seconds)
  const expirationTime = decoded.exp * 1000 // Convert to milliseconds
  const currentTime = Date.now()
  const bufferTime = 5 * 60 * 1000 // 5 minutes buffer

  return expirationTime - currentTime < bufferTime
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null

  return new Date(decoded.exp * 1000)
}

/**
 * Store auth tokens in localStorage
 */
export function storeTokens(token: string, refreshToken?: string): void {
  localStorage.setItem("auth_token", token)
  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken)
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}

/**
 * Clear all auth tokens from localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
}
