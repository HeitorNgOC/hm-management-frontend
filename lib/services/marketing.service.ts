import { apiClient } from "@/lib/api-client"
import type { MarketingFilters } from "@/lib/types/marketing"

export const marketingService = {
  // Campaigns
  campaigns: {
    list: (filters?: MarketingFilters, page = 1) =>
      apiClient.get("/marketing/campaigns", { params: { ...filters, page } }),
    get: (id: string) => apiClient.get(`/marketing/campaigns/${id}`),
    create: (data: unknown) => apiClient.post("/marketing/campaigns", data),
    update: (id: string, data: unknown) => apiClient.put(`/marketing/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/marketing/campaigns/${id}`),
    send: (id: string) => apiClient.post(`/marketing/campaigns/${id}/send`),
    pause: (id: string) => apiClient.post(`/marketing/campaigns/${id}/pause`),
    cancel: (id: string) => apiClient.post(`/marketing/campaigns/${id}/cancel`),
  },

  // Templates
  templates: {
    list: (page = 1) => apiClient.get("/marketing/templates", { params: { page } }),
    get: (id: string) => apiClient.get(`/marketing/templates/${id}`),
    create: (data: unknown) => apiClient.post("/marketing/templates", data),
    update: (id: string, data: unknown) => apiClient.put(`/marketing/templates/${id}`, data),
    delete: (id: string) => apiClient.delete(`/marketing/templates/${id}`),
  },

  // Coupons
  coupons: {
    list: (filters?: MarketingFilters, page = 1) =>
      apiClient.get("/marketing/coupons", { params: { ...filters, page } }),
    get: (id: string) => apiClient.get(`/marketing/coupons/${id}`),
    create: (data: unknown) => apiClient.post("/marketing/coupons", data),
    update: (id: string, data: unknown) => apiClient.put(`/marketing/coupons/${id}`, data),
    delete: (id: string) => apiClient.delete(`/marketing/coupons/${id}`),
    validate: (code: string) => apiClient.post(`/marketing/coupons/${code}/validate`),
  },
}
