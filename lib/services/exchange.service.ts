import { apiClient } from "@/lib/api-client"
import type {
  Exchange,
  CreateExchangeRequest,
  UpdateExchangeRequest,
  ExchangeFilters,
  ExchangeStats,
} from "@/lib/types/exchange"
import type { PaginatedResponse } from "@/lib/types/common"

export const exchangeService = {
  getExchanges: async (page = 1, limit = 10, filters?: ExchangeFilters): Promise<PaginatedResponse<Exchange>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    })

    return apiClient.get(`/exchanges?${params}`)
  },

  getExchange: async (id: string): Promise<Exchange> => {
    return apiClient.get(`/exchanges/${id}`)
  },

  createExchange: async (data: CreateExchangeRequest): Promise<Exchange> => {
    return apiClient.post("/exchanges", data)
  },

  updateExchange: async (id: string, data: UpdateExchangeRequest): Promise<Exchange> => {
    return apiClient.patch(`/exchanges/${id}`, data)
  },

  completeExchange: async (id: string): Promise<Exchange> => {
    return apiClient.post(`/exchanges/${id}/complete`)
  },

  cancelExchange: async (id: string, reason?: string): Promise<Exchange> => {
    return apiClient.post(`/exchanges/${id}/cancel`, { reason })
  },

  getExchangeStats: async (startDate?: string, endDate?: string): Promise<ExchangeStats> => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })

    return apiClient.get(`/exchanges/stats?${params}`)
  },
}
