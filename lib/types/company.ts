export interface Company {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: Address
  operatingHours: OperatingHours[]
  serviceCategories: ServiceCategory[]
  paymentMethods: PaymentMethod[]
  subscriptionPlan: SubscriptionPlan
  subscriptionStatus: "active" | "inactive" | "trial" | "expired"
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface OperatingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 6 = Saturday
  isOpen: boolean
  openTime: string // HH:mm format
  closeTime: string // HH:mm format
  breakStart?: string
  breakEnd?: string
}

export interface ServiceCategory {
  id: string
  name: string
  description?: string
  isActive: boolean
  order: number
}

export interface PaymentMethod {
  id: string
  type: "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer"
  name: string
  isActive: boolean
  order: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  maxUsers: number
  maxLocations: number
}

export interface OnboardingData {
  step: number
  companyInfo?: CompanyInfoData
  operatingHours?: OperatingHours[]
  serviceCategories?: ServiceCategory[]
  paymentMethods?: PaymentMethod[]
  isComplete: boolean
}

export interface CompanyInfoData {
  name: string
  cnpj: string
  email: string
  phone: string
  address: Address
}
