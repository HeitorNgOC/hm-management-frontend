export interface Client {
  id: string
  companyId: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  cnpj?: string
  type: ClientType
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  gender?: string
  notes?: string
  totalSpent: number
  appointmentsCount: number
  lastVisit?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ClientType = "individual" | "business"

export interface CreateClientRequest {
  name: string
  email?: string
  phone?: string
  cpf?: string
  cnpj?: string
  type: ClientType
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  gender?: string
  notes?: string
}

export interface UpdateClientRequest {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  cnpj?: string
  type?: ClientType
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  gender?: string
  notes?: string
  isActive?: boolean
}

export interface ClientFilters {
  search?: string
  type?: ClientType
  city?: string
  isActive?: boolean
}
