import { apiClient } from "@/lib/api-client"
import type {
  CompanySettings,
  CommissionSetting,
  CreateCommissionSettingRequest,
  UpdateCompanySettingsRequest,
  CommissionSettingFilters,
} from "@/lib/types/settings"

const settingsService = {
  getCompanySettings: async () => {
    const response = await apiClient.get("/settings/company")
    return response.data as CompanySettings
  },

  updateCompanySettings: async (data: UpdateCompanySettingsRequest) => {
    const response = await apiClient.put("/settings/company", data)
    return response.data as CompanySettings
  },

  getCommissionSettings: async (filters?: CommissionSettingFilters) => {
    const response = await apiClient.get("/settings/commissions", { params: filters })
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as CommissionSetting[]
    if (Array.isArray(payload.data)) return payload.data as CommissionSetting[]
    if (Array.isArray(payload.items)) return payload.items as CommissionSetting[]
    return [] as CommissionSetting[]
  },

  createCommissionSetting: async (data: CreateCommissionSettingRequest) => {
    const response = await apiClient.post("/settings/commissions", data)
    return response.data as CommissionSetting
  },

  updateCommissionSetting: async (id: string, data: Partial<CreateCommissionSettingRequest>) => {
    const response = await apiClient.put(`/settings/commissions/${id}`, data)
    return response.data as CommissionSetting
  },

  deleteCommissionSetting: async (id: string) => {
    await apiClient.delete(`/settings/commissions/${id}`)
  },
}

export { settingsService }
