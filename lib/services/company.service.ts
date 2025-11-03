import { apiClient } from "@/lib/api-client"
import type { Company, CompanyInfoData, OperatingHours, ServiceCategory, PaymentMethod } from "@/lib/types/company"
import type { ApiResponse } from "@/lib/types/common"

const companyService = {
  getCompany: async (): Promise<Company> => {
    const response = await apiClient.get<ApiResponse<Company>>("/company/profile")
    return response.data.data
  },

  updateCompanyInfo: async (data: CompanyInfoData): Promise<Company> => {
    const response = await apiClient.put<ApiResponse<Company>>("/company/info", data)
    return response.data.data
  },

  updateOperatingHours: async (hours: OperatingHours[]): Promise<Company> => {
    const response = await apiClient.put<ApiResponse<Company>>("/company/operating-hours", {
      operatingHours: hours,
    })
    return response.data.data
  },

  getServiceCategories: async (): Promise<ServiceCategory[]> => {
    const response = await apiClient.get<ApiResponse<ServiceCategory[]>>("/company/service-categories")
    return response.data.data
  },

  createServiceCategory: async (data: Omit<ServiceCategory, "id">): Promise<ServiceCategory> => {
    const response = await apiClient.post<ApiResponse<ServiceCategory>>("/company/service-categories", data)
    return response.data.data
  },

  updateServiceCategory: async (id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const response = await apiClient.put<ApiResponse<ServiceCategory>>(`/company/service-categories/${id}`, data)
    return response.data.data
  },

  deleteServiceCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/company/service-categories/${id}`)
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<ApiResponse<PaymentMethod[]>>("/company/payment-methods")
    return response.data.data
  },

  updatePaymentMethods: async (methods: PaymentMethod[]): Promise<PaymentMethod[]> => {
    const response = await apiClient.put<ApiResponse<PaymentMethod[]>>("/company/payment-methods", {
      paymentMethods: methods,
    })
    return response.data.data
  },

  completeOnboarding: async (): Promise<Company> => {
    const response = await apiClient.post<ApiResponse<Company>>("/company/complete-onboarding")
    return response.data.data
  },
}

export { companyService }
