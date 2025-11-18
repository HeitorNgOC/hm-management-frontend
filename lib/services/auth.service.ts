import { apiClient } from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthData } from "@/lib/types/auth"
import type { ApiResponse } from "@/lib/types/api"
import type { User as DomainUser } from "@/lib/types/user"
import type { AcceptInviteRequest } from "@/lib/types/iam"
import { getAuthToken, decodeToken } from "@/lib/utils/token"
import { userService } from "@/lib/services/user.service"

/**
 * Authentication service
 * Handles all auth-related API calls
 */
const authService = {
  // Services should only handle API requests, no business logic
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthData> => {
    const response = await apiClient.post<AuthData>("/auth/login", credentials)
    return response.data
  },

  /**
   * Register new user and company
   */
  register: async (data: RegisterRequest): Promise<AuthData> => {
    const response = await apiClient.post<AuthData>("/auth/register", data)
    return response.data
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<DomainUser> => {
    const response = await apiClient.post<DomainUser>("/users/me")
    return response.data
  },

  /**
   * Get current user via token payload (when /auth/me is not available)
   */
  currentUser: async (): Promise<DomainUser> => {
    const response = await apiClient.get<DomainUser>("/auth/me")
    return response.data
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
    const response = await apiClient.post<{ token: string }>("/auth/refresh", { refreshToken })
    return response.data
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
  acceptInvite: async (data: AcceptInviteRequest): Promise<AuthData> => {
    const response = await apiClient.post<AuthData>("/auth/accept-invite", data)
    return response.data
  },
}

export { authService }
