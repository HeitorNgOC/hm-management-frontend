import { apiClient } from "@/lib/api-client"
import type {
  InventoryItem,
  InventoryMovement,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  CreateMovementRequest,
  InventoryFilters,
} from "@/lib/types/inventory"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const inventoryService = {
  getItems: async (filters?: InventoryFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.supplierId && { supplierId: filters.supplierId }),
    })

    const response = await apiClient.get<PaginatedResponse<InventoryItem>>(`/inventory?${params.toString()}`)
    return response.data
  },

  getItemById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`)
    return response.data
  },

  createItem: async (data: CreateInventoryItemRequest) => {
    const response = await apiClient.post<ApiResponse<InventoryItem>>("/inventory", data)
    return response.data
  },

  updateItem: async (id: string, data: UpdateInventoryItemRequest) => {
    const response = await apiClient.patch<ApiResponse<InventoryItem>>(`/inventory/${id}`, data)
    return response.data
  },

  deleteItem: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/inventory/${id}`)
    return response.data
  },

  getMovements: async (itemId?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(itemId && { itemId }),
    })

    const response = await apiClient.get<PaginatedResponse<InventoryMovement>>(
      `/inventory/movements?${params.toString()}`,
    )
    return response.data
  },

  createMovement: async (data: CreateMovementRequest) => {
    const response = await apiClient.post<ApiResponse<InventoryMovement>>("/inventory/movements", data)
    return response.data
  },

  getLowStockItems: async () => {
    const response = await apiClient.get<ApiResponse<InventoryItem[]>>("/inventory/low-stock")
    return response.data
  },
}

export { inventoryService }
