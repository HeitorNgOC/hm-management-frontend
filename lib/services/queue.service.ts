import { apiClient } from "@/lib/api-client"
import type {
  QueueTicket,
  QueueDesk,
  QueueSettings,
  QueueStats,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateDeskRequest,
  UpdateDeskRequest,
  CallNextRequest,
  QueueTicketFilters,
  QueueDeskFilters,
} from "@/lib/types/queue"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

export const queueTicketService = {
  getTickets: async (filters?: QueueTicketFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.serviceType && { serviceType: filters.serviceType }),
      ...(filters?.date && { date: filters.date }),
    })

    const response = await apiClient.get<PaginatedResponse<QueueTicket>>(`/queue/tickets?${params.toString()}`)
    return response.data
  },

  getTicketById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<QueueTicket>>(`/queue/tickets/${id}`)
    return response.data
  },

  createTicket: async (data: CreateTicketRequest) => {
    const response = await apiClient.post<ApiResponse<QueueTicket>>("/queue/tickets", data)
    return response.data
  },

  updateTicket: async (id: string, data: UpdateTicketRequest) => {
    const response = await apiClient.patch<ApiResponse<QueueTicket>>(`/queue/tickets/${id}`, data)
    return response.data
  },

  cancelTicket: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<QueueTicket>>(`/queue/tickets/${id}/cancel`)
    return response.data
  },

  getStats: async (date?: string) => {
    const params = date ? `?date=${date}` : ""
    const response = await apiClient.get<ApiResponse<QueueStats>>(`/queue/stats${params}`)
    return response.data
  },
}

export const queueDeskService = {
  getDesks: async (filters?: QueueDeskFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
    })

    const response = await apiClient.get<PaginatedResponse<QueueDesk>>(`/queue/desks?${params.toString()}`)
    return response.data
  },

  getDeskById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<QueueDesk>>(`/queue/desks/${id}`)
    return response.data
  },

  createDesk: async (data: CreateDeskRequest) => {
    const response = await apiClient.post<ApiResponse<QueueDesk>>("/queue/desks", data)
    return response.data
  },

  updateDesk: async (id: string, data: UpdateDeskRequest) => {
    const response = await apiClient.patch<ApiResponse<QueueDesk>>(`/queue/desks/${id}`, data)
    return response.data
  },

  deleteDesk: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/queue/desks/${id}`)
    return response.data
  },

  callNext: async (data: CallNextRequest) => {
    const response = await apiClient.post<ApiResponse<QueueTicket>>("/queue/call-next", data)
    return response.data
  },

  completeService: async (deskId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(`/queue/desks/${deskId}/complete`)
    return response.data
  },
}

export const queueSettingsService = {
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse<QueueSettings>>("/queue/settings")
    return response.data
  },

  updateSettings: async (data: Partial<QueueSettings>) => {
    const response = await apiClient.patch<ApiResponse<QueueSettings>>("/queue/settings", data)
    return response.data
  },
}
