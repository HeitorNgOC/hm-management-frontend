import { apiClient } from "@/lib/api-client"
import type { User, CreateUserRequest, UpdateUserRequest, UserFilters } from "@/lib/types/user"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const userService = {
  getUsers: async (filters?: UserFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.positionId && { positionId: filters.positionId }),
    })

    const response = await apiClient.get<PaginatedResponse<User>>(`/users?${params.toString()}`)
    return response.data
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await apiClient.post<ApiResponse<User>>("/users", data)
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`)
    return response.data
  },

  updateUserStatus: async (id: string, status: "active" | "inactive" | "on_leave") => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, {
      status,
    })
    return response.data
  },
}

export { userService }
