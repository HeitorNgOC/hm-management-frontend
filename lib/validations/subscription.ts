import { z } from "zod"

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, "Selecione um plano"),
  paymentMethod: z.string().min(1, "Selecione um método de pagamento"),
  autoRenew: z.boolean().optional(),
})

export const createPaymentSchema = z.object({
  subscriptionId: z.string().optional(),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  method: z.enum(["credit_card", "debit_card", "pix", "boleto", "cash"]),
  description: z.string().optional(),
})

export type CreateSubscriptionFormData = z.infer<typeof createSubscriptionSchema>
export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>
