import { z } from "zod"

export const createInventoryItemSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU é obrigatório"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  quantity: z.number().min(0, "Quantidade não pode ser negativa"),
  minQuantity: z.number().min(0, "Quantidade mínima não pode ser negativa"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  costPrice: z.number().min(0, "Preço de custo não pode ser negativo"),
  sellPrice: z.number().min(0, "Preço de venda não pode ser negativo").optional(),
  supplierId: z.string().optional(),
  location: z.string().optional(),
  expirationDate: z.string().optional(),
})

export const updateInventoryItemSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  minQuantity: z.number().min(0).optional(),
  unit: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  sellPrice: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  location: z.string().optional(),
  expirationDate: z.string().optional(),
})

export const createMovementSchema = z.object({
  itemId: z.string().min(1, "Selecione um item"),
  type: z.enum(["entry", "exit", "adjustment", "loss"]),
  quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
  reason: z.string().optional(),
})

export type CreateInventoryItemFormData = z.infer<typeof createInventoryItemSchema>
export type UpdateInventoryItemFormData = z.infer<typeof updateInventoryItemSchema>
export type CreateMovementFormData = z.infer<typeof createMovementSchema>
