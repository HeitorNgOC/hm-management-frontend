import { apiClient } from "@/lib/api-client"
import type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignFilters,
  CampaignAnalytics,
} from "@/lib/types/campaign"

const campaignService = {
  getAll: async (filters?: CampaignFilters) => {
    const response = await apiClient.get("/campaigns", { params: filters })
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as Campaign[]
    if (Array.isArray(payload.data)) return payload.data as Campaign[]
    if (Array.isArray(payload.items)) return payload.items as Campaign[]
    return [] as Campaign[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/campaigns/${id}`)
    return response.data as Campaign
  },

  getAnalytics: async (id: string) => {
    const response = await apiClient.get(`/campaigns/${id}/analytics`)
    return response.data as CampaignAnalytics
  },

  create: async (data: CreateCampaignRequest) => {
    const response = await apiClient.post("/campaigns", data)
    return response.data as Campaign
  },

  update: async (id: string, data: UpdateCampaignRequest) => {
    const response = await apiClient.put(`/campaigns/${id}`, data)
    return response.data as Campaign
  },

  delete: async (id: string) => {
    await apiClient.delete(`/campaigns/${id}`)
  },

  launch: async (id: string) => {
    const response = await apiClient.post(`/campaigns/${id}/launch`)
    return response.data as Campaign
  },

  pause: async (id: string) => {
    const response = await apiClient.post(`/campaigns/${id}/pause`)
    return response.data as Campaign
  },
}

export { campaignService }
