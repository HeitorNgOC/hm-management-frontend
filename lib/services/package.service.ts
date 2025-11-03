import { apiClient } from "@/lib/api-client"
import type { Package, CreatePackageRequest, UpdatePackageRequest, PackageFilters } from "@/lib/types/package"

const packageService = {
  getAll: async (filters?: PackageFilters) => {
    const response = await apiClient.get("/packages", { params: filters })
    return response.data as Package[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/packages/${id}`)
    return response.data as Package
  },

  create: async (data: CreatePackageRequest) => {
    const response = await apiClient.post("/packages", data)
    return response.data as Package
  },

  update: async (id: string, data: UpdatePackageRequest) => {
    const response = await apiClient.put(`/packages/${id}`, data)
    return response.data as Package
  },

  delete: async (id: string) => {
    await apiClient.delete(`/packages/${id}`)
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/packages/bulk-delete", { ids })
  },
}

export { packageService }
