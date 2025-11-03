import { z } from "zod"

export const createPositionSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Selecione pelo menos uma permissão"),
})

export const updatePositionSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

export type CreatePositionFormData = z.infer<typeof createPositionSchema>
export type UpdatePositionFormData = z.infer<typeof updatePositionSchema>
