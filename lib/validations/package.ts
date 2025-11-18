import { z } from "zod"

export const packageItemSchema = z.object({
  serviceId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().min(1, "Quantidade deve ser ao menos 1"),
})

export const createPackageSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço inválido"),
  items: z.array(packageItemSchema).min(1, "Adicione ao menos um item"),
  discountPercentage: z.number().min(0).max(100).optional(),
})

export const updatePackageSchema = createPackageSchema.partial()

export type CreatePackageFormData = z.infer<typeof createPackageSchema>
export type UpdatePackageFormData = z.infer<typeof updatePackageSchema>

export default createPackageSchema
