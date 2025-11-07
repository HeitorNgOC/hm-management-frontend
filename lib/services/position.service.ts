import { apiClient } from "@/lib/api-client"
import type { Position, CreatePositionRequest, UpdatePositionRequest } from "@/lib/types/position"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const positionService = {
  getPositions: async (page = 1, limit = 50) => {
    // Normalize server pagination shape to our PaginatedResponse<T>
    const response = await apiClient.post<ApiResponse<any>>(`/positions/list`, {
      page,
      limit,
    })

    const payload = response.data?.data ?? {}
    const items: Position[] = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
      ? payload.data
      : []
    const currentPage: number = Number(payload.page) || page || 1
    const pageLimit: number = Number(payload.limit) || limit || 50
    const total: number = Number(payload.total ?? items.length ?? 0)
    const totalPages: number = Number(payload.totalPages ?? (pageLimit ? Math.max(1, Math.ceil(total / pageLimit)) : 1))

    const normalized: PaginatedResponse<Position> = {
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

  getPositionById: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Position>>(`/positions/get`, { id })
    return response.data
  },

  createPosition: async (data: CreatePositionRequest) => {
    const response = await apiClient.post<ApiResponse<Position>>(`/positions`, { ...data })
    return response.data
  },

  updatePosition: async (id: string, data: UpdatePositionRequest) => {
    const response = await apiClient.patch<ApiResponse<Position>>(`/positions/${id}`, { ...data })
    return response.data
  },

  deletePosition: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(`/positions/delete`, { id })
    return response.data
  },
}

export { positionService }
