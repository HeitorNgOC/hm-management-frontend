import { apiClient } from "@/lib/api-client"
import type { Service, CreateServiceRequest, UpdateServiceRequest, ServiceFilters } from "@/lib/types/service"

const serviceService = {
  getAll: async (filters?: ServiceFilters) => {
    const response = await apiClient.get("/services", { params: filters })
    return response.data as Service[]
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
