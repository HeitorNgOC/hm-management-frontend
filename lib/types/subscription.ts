export interface Subscription {
  id: string
  companyId: string
  planId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate: string
  autoRenew: boolean
  paymentMethod?: string
  lastPaymentDate?: string
  nextPaymentDate?: string
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  interval: BillingInterval
  features: string[]
  maxUsers?: number
  maxLocations?: number
  active: boolean
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired" | "trial"
export type BillingInterval = "monthly" | "quarterly" | "yearly"

export interface Payment {
  id: string
  companyId: string
  subscriptionId?: string
  amount: number
  status: PaymentStatus
  method: PaymentMethod
  description?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
export type PaymentMethod = "credit_card" | "debit_card" | "pix" | "boleto" | "cash"

export interface CreateSubscriptionRequest {
  planId: string
  paymentMethod: string
  autoRenew?: boolean
}

export interface UpdateSubscriptionRequest {
  planId?: string
  autoRenew?: boolean
  paymentMethod?: string
}

export interface CreatePaymentRequest {
  subscriptionId?: string
  amount: number
  method: PaymentMethod
  description?: string
}
