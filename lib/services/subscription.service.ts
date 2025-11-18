import { apiClient } from "@/lib/api-client"
import type {
  Subscription,
  SubscriptionPlan,
  Payment,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentRequest,
} from "@/lib/types/subscription"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const subscriptionService = {
  getPlans: async () => {
    const response = await apiClient.get<SubscriptionPlan[]>("/subscription/plans")
    return response.data
  },

  getCurrentSubscription: async () => {
    const response = await apiClient.get<Subscription>("/subscription/current")
    return response.data
  },

  createSubscription: async (data: CreateSubscriptionRequest) => {
    const response = await apiClient.post<Subscription>("/subscription", data)
    return response.data
  },

  updateSubscription: async (id: string, data: UpdateSubscriptionRequest) => {
    const response = await apiClient.patch<Subscription>(`/subscription/${id}`, data)
    return response.data
  },

  cancelSubscription: async (id: string) => {
    const response = await apiClient.post<Subscription>(`/subscription/${id}/cancel`)
    return response.data
  },

  getPayments: async (page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<Payment>>(`/payments?page=${page}&limit=${limit}`)
    return response.data
  },

  createPayment: async (data: CreatePaymentRequest) => {
    const response = await apiClient.post<Payment>("/payments", data)
    return response.data
  },
}

export { subscriptionService }
