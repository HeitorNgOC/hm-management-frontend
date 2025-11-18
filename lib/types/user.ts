export interface User {
  id: string
  companyId: string
  name: string
  email: string
  phone: string
  cpf: string
  positionId: string
  position?: Position
  role: UserRole
  permissions: Permission[]
  status: UserStatus
  avatar?: string
  hireDate: string
  salary?: number
  commission?: number
  createdAt: string
  updatedAt: string
}

export interface Position {
  id: string
  name: string
  description?: string
  permissions: Permission[]
}

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE"

export type UserStatus = "active" | "inactive" | "on_leave"

export type Permission =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.delete"
  | "inventory.view"
  | "inventory.create"
  | "inventory.edit"
  | "inventory.delete"
  | "financial.view"
  | "financial.manage"
  | "financial.create"
  | "financial.edit"
  | "financial.delete"
  | "reports.export"
  | "marketing.view"
  | "reports.view"
  | "settings.view"
  | "settings.edit"

export interface CreateUserRequest {
  name: string
  email: string
  phone: string
  cpf: string
  positionId: string
  role: UserRole
  hireDate: string
  salary?: number
  commission?: number
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  positionId?: string
  role?: UserRole
  status?: UserStatus
  hireDate?: string
  salary?: number
  commission?: number
}

export interface UserFilters {
  search?: string
  role?: UserRole
  status?: UserStatus
  positionId?: string
}
