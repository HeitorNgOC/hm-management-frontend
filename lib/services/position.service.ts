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

    // apiClient unwraps envelopes so response.data can be either:
    // - the inner payload: { items: [...], page, limit, total }
    // - or an envelope with .data: { items: [...] }
    const payload = response.data ?? (response.data as any)?.data ?? {}

    const items: Position[] = Array.isArray((payload as any).items)
      ? (payload as any).items
      : Array.isArray((payload as any).data)
      ? (payload as any).data
      : []

    const currentPage: number = Number((payload as any).page) || page || 1
    const pageLimit: number = Number((payload as any).limit) || limit || 50
    const total: number = Number((payload as any).total ?? items.length ?? 0)
    const totalPages: number = Number((payload as any).totalPages ?? (pageLimit ? Math.max(1, Math.ceil(total / pageLimit)) : 1))

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
    // Backend expects POST for update operations. Use the /positions/update route with id and data in body.
    const response = await apiClient.post<ApiResponse<Position>>(`/positions/update`, { id, ...data })
    return response.data
  },

  deletePosition: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(`/positions/delete`, { id })
    return response.data
  },
}

export { positionService }
