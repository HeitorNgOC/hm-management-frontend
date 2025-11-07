import { apiClient } from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/lib/types/auth"
import type { User as DomainUser } from "@/lib/types/user"
import type { AcceptInviteRequest } from "@/lib/types/iam"
import type { ApiResponse } from "@/lib/types/common"
import { getAuthToken, decodeToken } from "@/lib/utils/token"
import { userService } from "@/lib/services/user.service"

/**
 * Authentication service
 * Handles all auth-related API calls
 */
const authService = {
  // Normalize different backend shapes into AuthResponse
  _normalizeAuthData(data: any): AuthResponse {
    // New shape: data = { token: { token, refreshToken? }, user }
    if (data && data.token && typeof data.token === "object" && "token" in data.token) {
      return {
        user: data.user as any,
        token: {
          token: data.token.token as string,
          refreshToken: (data.token as any).refreshToken as string | undefined,
        },
      }
    }
    // Legacy shape: data = { token, refreshToken?, user }
    return {
      user: data.user as any,
      token: {
        token: data.token as string,
        refreshToken: data.refreshToken as string | undefined,
      },
    }
  },
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<any>>("/auth/login", credentials)
    return authService._normalizeAuthData(response.data.data)
  },

  /**
   * Register new user and company
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<any>>("/auth/register", data)
    return authService._normalizeAuthData(response.data.data)
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<DomainUser> => {
    const response = await apiClient.get<ApiResponse<any>>("/auth/me")
    return response.data.data as DomainUser
  },

  /**
   * Get current user via token payload (when /auth/me is not available)
   */
  currentUser: async (): Promise<DomainUser> => {
    // Prefer user id from session; fallback to token payload
    let userId: string | undefined
    let companyId: string | undefined
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user")
        if (raw) {
          const u = JSON.parse(raw)
          if (u?.id) userId = String(u.id)
          if (u?.companyId) companyId = String(u.companyId)
        }
      } catch {}
    }
      if (!userId || !companyId) {
      const token = getAuthToken()
      if (!token) throw new Error("Missing auth token")
      const payload: any = decodeToken(token)
        if (!userId) userId = payload?.userId || payload?.sub
        if (!companyId) companyId = payload?.companyId
    }
      if (!userId) throw new Error("Cannot resolve current user id")

      const res = await userService.getUserById(userId)
    return res.data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout")
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>("/auth/refresh", {
      refreshToken,
    })
    return response.data.data
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email })
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { token, newPassword })
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post("/auth/verify-email", { token })
  },

  /**
   * Accept invitation (public)
   * Creates password and onboards the user into the correct company
   */
  acceptInvite: async (data: AcceptInviteRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<any>>("/auth/accept-invite", data)
    return authService._normalizeAuthData(response.data.data)
  },
}

export { authService }
