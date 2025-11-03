import { apiClient } from "@/lib/api-client"
import type { Position, CreatePositionRequest, UpdatePositionRequest } from "@/lib/types/position"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const positionService = {
  getPositions: async (page = 1, limit = 50) => {
    const response = await apiClient.get<PaginatedResponse<Position>>(`/positions?page=${page}&limit=${limit}`)
    return response.data
  },

  getPositionById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Position>>(`/positions/${id}`)
    return response.data
  },

  createPosition: async (data: CreatePositionRequest) => {
    const response = await apiClient.post<ApiResponse<Position>>("/positions", data)
    return response.data
  },

  updatePosition: async (id: string, data: UpdatePositionRequest) => {
    const response = await apiClient.patch<ApiResponse<Position>>(`/positions/${id}`, data)
    return response.data
  },

  deletePosition: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/positions/${id}`)
    return response.data
  },
}

export { positionService }
