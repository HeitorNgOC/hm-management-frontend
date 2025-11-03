export interface Campaign {
  id: string
  companyId: string
  name: string
  description?: string
  type: "email" | "sms" | "push"
  status: "draft" | "scheduled" | "sent" | "paused" | "cancelled"
  templateId: string
  template?: EmailTemplate
  audience: CampaignAudience
  scheduleDate?: string
  sentAt?: string
  metrics: CampaignMetrics
  createdAt: string
  updatedAt: string
}

export interface CampaignAudience {
  type: "all" | "segment" | "custom"
  segmentId?: string
  customFilter?: Record<string, unknown>
  recipientCount: number
}

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
}

export interface EmailTemplate {
  id: string
  companyId: string
  name: string
  subject: string
  content: string
  htmlContent: string
  variables: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  companyId: string
  code: string
  description?: string
  discountType: "percentage" | "fixed"
  discountValue: number
  maxUses?: number
  currentUses: number
  startDate: string
  endDate: string
  isActive: boolean
  applicableTo: "all" | "specific_services" | "specific_products"
  serviceIds?: string[]
  productIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface MarketingFilters {
  search?: string
  status?: Campaign["status"]
  type?: Campaign["type"]
  startDate?: string
  endDate?: string
}
