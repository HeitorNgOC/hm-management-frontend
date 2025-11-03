import { z } from "zod"

export const createCampaignSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  description: z.string().optional(),
  type: z.enum(["email", "sms", "push"]),
  templateId: z.string().min(1, "Selecione um template"),
  audienceType: z.enum(["all", "segment", "custom"]),
  segmentId: z.string().optional(),
  scheduleDate: z.string().optional(),
})

export const createTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  subject: z.string().min(5),
  content: z.string().min(10),
  isDefault: z.boolean().default(false),
})

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0),
  maxUses: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  applicableType: z.enum(["all", "specific_services", "specific_products"]),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type CreateCouponInput = z.infer<typeof createCouponSchema>
