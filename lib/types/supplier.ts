export interface Supplier {
  id: string
  companyId: string
  name: string
  description?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  cnpj?: string
  contactPerson?: string
  website?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierRequest {
  name: string
  description?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  cnpj?: string
  contactPerson?: string
  website?: string
}

export interface UpdateSupplierRequest {
  name?: string
  description?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  cnpj?: string
  contactPerson?: string
  website?: string
  isActive?: boolean
}

export interface SupplierFilters {
  search?: string
  city?: string
  isActive?: boolean
}
