export interface Package {
  id: string
  companyId: string
  name: string
  description?: string
  image?: string
  price: number
  items: PackageItem[]
  discountPercentage?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PackageItem {
  id: string
  packageId: string
  serviceId: string
  service?: Service
  productId?: string
  quantity: number
}

export interface Service {
  id: string
  name: string
  price: number
}

export interface CreatePackageRequest {
  name: string
  description?: string
  price: number
  items: CreatePackageItem[]
  discountPercentage?: number
}

export interface CreatePackageItem {
  serviceId?: string
  productId?: string
  quantity: number
}

export interface UpdatePackageRequest {
  name?: string
  description?: string
  price?: number
  items?: CreatePackageItem[]
  discountPercentage?: number
  isActive?: boolean
}

export interface PackageFilters {
  search?: string
  isActive?: boolean
}
