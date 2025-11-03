import { apiClient } from "@/lib/api-client"
import type { Client, CreateClientRequest, UpdateClientRequest, ClientFilters } from "@/lib/types/client"

const clientService = {
  getAll: async (filters?: ClientFilters) => {
    const response = await apiClient.get("/clients", { params: filters })
    return response.data as Client[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}`)
    return response.data as Client
  },

  create: async (data: CreateClientRequest) => {
    const response = await apiClient.post("/clients", data)
    return response.data as Client
  },

  update: async (id: string, data: UpdateClientRequest) => {
    const response = await apiClient.put(`/clients/${id}`, data)
    return response.data as Client
  },

  delete: async (id: string) => {
    await apiClient.delete(`/clients/${id}`)
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/clients/bulk-delete", { ids })
  },
}

export { clientService }
