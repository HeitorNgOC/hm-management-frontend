import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duração inválida"),
  price: z.number().min(0, "Preço inválido"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
})

export type CreateServiceFormData = z.infer<typeof createServiceSchema>

export const updateServiceSchema = createServiceSchema.partial()
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>

export default createServiceSchema
