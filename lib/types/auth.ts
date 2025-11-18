import type { User, Permission, UserRole, UserStatus } from "./user"

import type { ApiResponse } from "./api"

// Re-export User from user.ts
export type { User } from "./user"

// Login request payload
export interface LoginRequest {
  email: string
  password: string
}

// Register request payload
export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
  companyName: string
}

/**
 * Token de autenticação
 */
export interface AuthToken {
  token: string
  refreshToken?: string
}

/**
 * Dados de autenticação bem-sucedida
 */
export interface AuthData {
  user: User
  token: AuthToken
}

/**
 * Resposta de autenticação da API
 * Estende ApiResponse com AuthData como tipo genérico
 */
export type AuthResponse = ApiResponse<AuthData>

// Token payload (decoded JWT)
export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  companyId: string
  exp: number
  iat: number
}

// Auth context state
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
