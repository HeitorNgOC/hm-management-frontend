import { z } from "zod"

const cpfFormatted = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const cpfDigits = /^\d{11}$/
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

export const createUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(phoneRegex, "Telefone inválido. Use o formato (00) 00000-0000"),
  cpf: z.string().refine((val) => cpfFormatted.test(val) || cpfDigits.test(val), {
    message: "CPF inválido. Use o formato 000.000.000-00 ou 11 dígitos",
  }),
  positionId: z.string().min(1, "Selecione um cargo"),
  role: z.enum(["admin", "manager", "employee"], {
    errorMap: () => ({ message: "Selecione um papel válido" }),
  }),
  hireDate: z.string().min(1, "Data de contratação é obrigatória"),
  salary: z.number().positive("Salário deve ser positivo").optional(),
  commission: z.number().min(0).max(100, "Comissão deve estar entre 0 e 100%").optional(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const updateUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().regex(phoneRegex, "Telefone inválido").optional(),
  cpf: z.string().refine((val) => !val || cpfFormatted.test(val) || cpfDigits.test(val), {
    message: "CPF inválido",
  }).optional(),
  positionId: z.string().min(1, "Selecione um cargo").optional(),
  role: z.enum(["admin", "manager", "employee"]).optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
  hireDate: z.string().optional(),
  salary: z.number().positive("Salário deve ser positivo").optional(),
  commission: z.number().min(0).max(100).optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
