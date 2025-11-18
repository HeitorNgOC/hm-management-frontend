import { apiClient } from "@/lib/api-client"
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest, SupplierFilters } from "@/lib/types/supplier"

const supplierService = {
  getAll: async (filters?: SupplierFilters) => {
    const response = await apiClient.get("/suppliers", { params: filters })
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as Supplier[]
    if (Array.isArray(payload.data)) return payload.data as Supplier[]
    if (Array.isArray(payload.items)) return payload.items as Supplier[]
    return [] as Supplier[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/suppliers/${id}`)
    return response.data as Supplier
  },

  create: async (data: CreateSupplierRequest) => {
    const response = await apiClient.post("/suppliers", data)
    return response.data as Supplier
  },

  update: async (id: string, data: UpdateSupplierRequest) => {
    const response = await apiClient.put(`/suppliers/${id}`, data)
    return response.data as Supplier
  },

  delete: async (id: string) => {
    await apiClient.delete(`/suppliers/${id}`)
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/suppliers/bulk-delete", { ids })
  },
}

export { supplierService }
