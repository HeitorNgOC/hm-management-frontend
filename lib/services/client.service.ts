import { apiClient } from "@/lib/api-client"
import type { Client, CreateClientRequest, UpdateClientRequest, ClientFilters } from "@/lib/types/client"

const clientService = {
  getAll: async (filters?: ClientFilters) => {
    const response = await apiClient.post("/clients/list", filters || {})
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as Client[]
    if (Array.isArray(payload.data)) return payload.data as Client[]
    if (Array.isArray(payload.items)) return payload.items as Client[]
    return [] as Client[]
  },

  getById: async (id: string) => {
    const response = await apiClient.post(`/clients/get`, { id })
    return response.data as Client
  },

  getMe: async () => {
    const response = await apiClient.get(`/clients/me`)
    return response.data as Client
  },

  create: async (data: CreateClientRequest) => {
    const response = await apiClient.post("/clients/create", data)
    return response.data as Client
  },

  update: async (id: string, data: UpdateClientRequest) => {
    const response = await apiClient.put(`/clients/update/${id}`, data)
    return response.data as Client
  },

  delete: async (id: string) => {
    await apiClient.post(`/clients/delete`, {  id  })
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/clients/bulk-delete", { ids })
  },

  // Request a magic link for the given email. Backend should send an email
  // containing a single-use tokenized link to the client.
  generateMagicLink: async (email: string) => {
    const response = await apiClient.post("/clients/generate-link", { email })
    return response.data
  },
}

export { clientService }
