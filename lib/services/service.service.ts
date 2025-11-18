import { apiClient } from "@/lib/api-client"
import type { Service, CreateServiceRequest, UpdateServiceRequest, ServiceFilters } from "@/lib/types/service"

const serviceService = {
  getAll: async (filters?: ServiceFilters) => {
    const response = await apiClient.get("/services", { params: filters })
    // apiClient unwraps envelopes in most cases, but some endpoints may still return { data: [...] } or { items: [...] }
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as Service[]
    if (Array.isArray(payload.data)) return payload.data as Service[]
    if (Array.isArray(payload.items)) return payload.items as Service[]
    // fallback: if response is a paginated object with data property absent, but contains pagination->data may be nested
    return [] as Service[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/services/${id}`)
    return response.data as Service
  },

  create: async (data: CreateServiceRequest) => {
    const response = await apiClient.post("/services", data)
    return response.data as Service
  },

  update: async (id: string, data: UpdateServiceRequest) => {
    const response = await apiClient.put(`/services/${id}`, data)
    return response.data as Service
  },

  delete: async (id: string) => {
    await apiClient.delete(`/services/${id}`)
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/services/bulk-delete", { ids })
  },
}

export { serviceService }
