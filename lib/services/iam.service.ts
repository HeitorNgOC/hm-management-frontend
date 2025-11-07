import { apiClient } from "@/lib/api-client"
import type { Invitation, CreateInvitationRequest, InvitationFilters } from "@/lib/types/iam"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const iamService = {
  // Invitations
  listInvitations: async (filters?: InvitationFilters, page = 1, limit = 20) => {
    // Normalize server pagination shape to our PaginatedResponse<T>
    const response = await apiClient.post<ApiResponse<any>>(`/iam/invitations/list`, {
      page,
      limit,
      ...(filters || {}),
    })

    const payload = response.data?.data ?? {}
    const items: Invitation[] = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
      ? payload.data
      : []
    const currentPage: number = Number(payload.page) || page || 1
    const pageLimit: number = Number(payload.limit) || limit || 20
    const total: number = Number(payload.total ?? items.length ?? 0)
    const totalPages: number = Number(payload.totalPages ?? (pageLimit ? Math.max(1, Math.ceil(total / pageLimit)) : 1))

    const normalized: PaginatedResponse<Invitation> = {
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

  getInvitationById: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Invitation>>(`/iam/invitations/get`, { id })
    return response.data
  },

  createInvitation: async (data: CreateInvitationRequest) => {
    const response = await apiClient.post<ApiResponse<Invitation>>(`/iam/invitations`, { ...data })
    return response.data
  },

  deleteInvitation: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(`/iam/invitations/delete`, { id })
    return response.data
  },

  resendInvitation: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(`/iam/invitations/resend`, { id })
    return response.data
  },
}

export { iamService }
