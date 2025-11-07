import { apiClient } from "@/lib/api-client"
import type { User, CreateUserRequest, UpdateUserRequest, UserFilters } from "@/lib/types/user"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const userService = {
  getUsers: async (filters?: UserFilters, page = 1, limit = 10) => {
    // Normalize server pagination shape to our PaginatedResponse<T>
    const response = await apiClient.post<ApiResponse<any>>(`/users/list`, {
      page,
      limit,
      ...(filters || {}),
    })

    const payload = response.data?.data ?? {}
    const rawItems: any[] = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
      ? payload.data
      : []
    // Normalize casing and enum values expected by the UI/types
    const items: User[] = rawItems.map((u: any) => ({
      ...u,
      role: typeof u.role === "string" ? (u.role.toLowerCase() as any) : u.role,
      status:
        typeof u.status === "string"
          ? ((u.status.toLowerCase() as string) as any)
          : u.status,
    }))
    const currentPage: number = Number(payload.page) || page || 1
    const pageLimit: number = Number(payload.limit) || limit || 10
    const total: number = Number(payload.total ?? items.length ?? 0)
    const totalPages: number = Number(payload.totalPages ?? (pageLimit ? Math.max(1, Math.ceil(total / pageLimit)) : 1))

    const normalized: PaginatedResponse<User> = {
      data: items,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
      },
    }

    return normalized
  },

  getUserById: async (id: string) => {
    const response = await apiClient.post<ApiResponse<User>>(`/users/get`, { id })
    return response.data
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await apiClient.post<ApiResponse<User>>(`/users`, { ...data })
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, { ...data })
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(`/users/delete`, { id })
    return response.data
  },

  updateUserStatus: async (id: string, status: "active" | "inactive" | "on_leave") => {
    const response = await apiClient.post<ApiResponse<User>>(`/users/status`, { id, status })
    return response.data
  },
}

export { userService }
