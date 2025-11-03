import { apiClient } from "@/lib/api-client"
import type {
  Table,
  Order,
  CreateTableRequest,
  UpdateTableRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  AddOrderItemRequest,
} from "@/lib/types/restaurant"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const restaurantService = {
  // Tables
  getTables: async () => {
    const response = await apiClient.get<ApiResponse<Table[]>>("/tables")
    return response.data
  },

  getTableById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`)
    return response.data
  },

  createTable: async (data: CreateTableRequest) => {
    const response = await apiClient.post<ApiResponse<Table>>("/tables", data)
    return response.data
  },

  updateTable: async (id: string, data: UpdateTableRequest) => {
    const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}`, data)
    return response.data
  },

  deleteTable: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/tables/${id}`)
    return response.data
  },

  // Orders
  getOrders: async (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    })
    const response = await apiClient.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`)
    return response.data
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  createOrder: async (data: CreateOrderRequest) => {
    const response = await apiClient.post<ApiResponse<Order>>("/orders", data)
    return response.data
  },

  updateOrder: async (id: string, data: UpdateOrderRequest) => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data)
    return response.data
  },

  addOrderItem: async (orderId: string, data: AddOrderItemRequest) => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/items`, data)
    return response.data
  },

  removeOrderItem: async (orderId: string, itemId: string) => {
    const response = await apiClient.delete<ApiResponse<Order>>(`/orders/${orderId}/items/${itemId}`)
    return response.data
  },

  closeOrder: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/close`)
    return response.data
  },
}

export { restaurantService }
