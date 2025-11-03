export interface Campaign {
  id: string
  companyId: string
  name: string
  description?: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate: string
  targetAudience?: string
  message?: string
  discountPercentage?: number
  reachCount: number
  conversionCount: number
  budget?: number
  createdAt: string
  updatedAt: string
}

export type CampaignType = "email" | "sms" | "social" | "discount" | "loyalty" | "referral"

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled"

export interface CreateCampaignRequest {
  name: string
  description?: string
  type: CampaignType
  startDate: string
  endDate: string
  targetAudience?: string
  message?: string
  discountPercentage?: number
  budget?: number
}

export interface UpdateCampaignRequest {
  name?: string
  description?: string
  status?: CampaignStatus
  startDate?: string
  endDate?: string
  targetAudience?: string
  message?: string
  discountPercentage?: number
}

export interface CampaignFilters {
  type?: CampaignType
  status?: CampaignStatus
  search?: string
}

export interface CampaignAnalytics {
  campaignId: string
  impressions: number
  clicks: number
  conversions: number
  roi: number
  revenue: number
}
