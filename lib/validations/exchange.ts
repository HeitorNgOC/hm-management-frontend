import { z } from "zod"

export const createExchangeSchema = z
  .object({
    customerName: z.string().min(1, "Nome do cliente é obrigatório"),
    customerId: z.string().optional(),
    originalItemId: z.string().min(1, "Produto original é obrigatório"),
    originalQuantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    newItemId: z.string().min(1, "Novo produto é obrigatório"),
    newQuantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    reason: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.originalItemId !== data.newItemId, {
    message: "O produto novo deve ser diferente do produto original",
    path: ["newItemId"],
  })

export const updateExchangeSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
})

export const exchangeFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type CreateExchangeInput = z.infer<typeof createExchangeSchema>
export type UpdateExchangeInput = z.infer<typeof updateExchangeSchema>
export type ExchangeFiltersInput = z.infer<typeof exchangeFiltersSchema>
