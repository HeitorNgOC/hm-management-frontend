import { apiClient } from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "@/lib/types/auth"
import type { ApiResponse } from "@/lib/types/common"

/**
 * Authentication service
 * Handles all auth-related API calls
 */
const authService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", credentials)
    return response.data.data
  },

  /**
   * Register new user and company
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data)
    return response.data.data
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me")
    return response.data.data
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
}

export { authService }
