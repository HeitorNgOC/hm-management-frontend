import { z } from "zod"

export const createTableSchema = z.object({
  number: z.string().min(1, "Número da mesa é obrigatório"),
  capacity: z.number().min(1, "Capacidade deve ser no mínimo 1").max(20, "Capacidade máxima é 20"),
  location: z.string().optional(),
})

export const createOrderSchema = z.object({
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Selecione um produto"),
        quantity: z.number().min(1, "Quantidade deve ser no mínimo 1"),
        notes: z.string().optional(),
      }),
    )
    .min(1, "Adicione pelo menos um item"),
  notes: z.string().optional(),
})

export const addOrderItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.number().min(1, "Quantidade deve ser no mínimo 1"),
  notes: z.string().optional(),
})

export type CreateTableFormData = z.infer<typeof createTableSchema>
export type CreateOrderFormData = z.infer<typeof createOrderSchema>
export type AddOrderItemFormData = z.infer<typeof addOrderItemSchema>
