// User roles in the system
export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE" | "CUSTOMER"

// User status
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

// Permission types
export type Permission =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "positions.view"
  | "positions.create"
  | "positions.edit"
  | "positions.delete"
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.delete"
  | "inventory.view"
  | "inventory.create"
  | "inventory.edit"
  | "inventory.delete"
  | "restaurant.view"
  | "restaurant.create"
  | "restaurant.edit"
  | "restaurant.delete"
  | "financial.view"
  | "financial.create"
  | "financial.edit"
  | "financial.delete"
  | "reports.view"
  | "reports.export"
  | "settings.view"
  | "settings.edit"
  | "payments.view"
  | "payments.manage"

// User entity
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  companyId: string
  positionId?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

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

// Auth response from API
export interface AuthResponse {
  user: User
  token: {
    token: string
    refreshToken?: string
  }
}

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
