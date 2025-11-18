import { z } from "zod"

export const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  type: z.enum(["individual", "business"]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateClientFormData = z.infer<typeof createClientSchema>

export const updateClientSchema = createClientSchema.partial()
export type UpdateClientFormData = z.infer<typeof updateClientSchema>
