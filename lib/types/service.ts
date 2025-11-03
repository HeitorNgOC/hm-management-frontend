export interface Service {
  id: string
  companyId: string
  name: string
  description?: string
  duration: number // minutes
  price: number
  categoryId: string
  category?: ServiceCategory
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceCategory {
  id: string
  companyId: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceRequest {
  name: string
  description?: string
  duration: number
  price: number
  categoryId: string
}

export interface UpdateServiceRequest {
  name?: string
  description?: string
  duration?: number
  price?: number
  categoryId?: string
  isActive?: boolean
}

export interface ServiceFilters {
  categoryId?: string
  search?: string
  isActive?: boolean
}
