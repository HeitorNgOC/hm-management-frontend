import { apiClient } from "@/lib/api-client"
import type { Company, CompanyInfoData, OperatingHours, ServiceCategory, PaymentMethod } from "@/lib/types/company"
import type { ApiResponse } from "@/lib/types/common"

const companyService = {
  getCompany: async (): Promise<Company> => {
    const response = await apiClient.get<Company>("/company/profile")
    return response.data
  },

  updateCompanyInfo: async (data: CompanyInfoData): Promise<Company> => {
    const response = await apiClient.put<Company>("/company/info", data)
    return response.data
  },

  updateOperatingHours: async (hours: OperatingHours[]): Promise<Company> => {
    const response = await apiClient.put<Company>("/company/operating-hours", {
      operatingHours: hours,
    })
    return response.data
  },

  getServiceCategories: async (): Promise<ServiceCategory[]> => {
    const response = await apiClient.get<ServiceCategory[]>("/company/service-categories")
    return response.data
  },

  createServiceCategory: async (data: Omit<ServiceCategory, "id">): Promise<ServiceCategory> => {
    const response = await apiClient.post<ServiceCategory>("/company/service-categories", data)
    return response.data
  },

  updateServiceCategory: async (id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const response = await apiClient.put<ServiceCategory>(`/company/service-categories/${id}`, data)
    return response.data
  },

  deleteServiceCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/company/service-categories/${id}`)
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethod[]>("/company/payment-methods")
    return response.data
  },

  updatePaymentMethods: async (methods: PaymentMethod[]): Promise<PaymentMethod[]> => {
    const response = await apiClient.put<PaymentMethod[]>("/company/payment-methods", {
      paymentMethods: methods,
    })
    return response.data
  },

  completeOnboarding: async (): Promise<Company> => {
    const response = await apiClient.post<Company>("/company/complete-onboarding")
    return response.data
  },
}

export { companyService }
