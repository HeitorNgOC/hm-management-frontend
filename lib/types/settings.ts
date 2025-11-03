export interface CompanySettings {
  id: string
  companyId: string
  businessName: string
  cnpj?: string
  email: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  businessType?: string
  taxId?: string
  registrationNumber?: string
  currency: string
  timeZone: string
  language: string
  createdAt: string
  updatedAt: string
}

export interface CommissionSetting {
  id: string
  companyId: string
  serviceId?: string
  employeeId?: string
  percentage: number
  description?: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCommissionSettingRequest {
  serviceId?: string
  employeeId?: string
  percentage: number
  description?: string
  isDefault: boolean
}

export interface UpdateCompanySettingsRequest {
  businessName?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  businessType?: string
  currency?: string
  timeZone?: string
  language?: string
}

export interface CommissionSettingFilters {
  serviceId?: string
  employeeId?: string
  isDefault?: boolean
  isActive?: boolean
}
