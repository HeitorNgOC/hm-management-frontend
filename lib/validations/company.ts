import { z } from "zod"

// Validação de CNPJ
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/

// Validação de telefone brasileiro
const phoneRegex = /^$$\d{2}$$\s\d{4,5}-\d{4}$/

// Validação de CEP
const zipCodeRegex = /^\d{5}-\d{3}$/

export const addressSchema = z.object({
  street: z.string().min(3, "Rua deve ter no mínimo 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, "Bairro deve ter no mínimo 3 caracteres"),
  city: z.string().min(3, "Cidade deve ter no mínimo 3 caracteres"),
  state: z.string().length(2, "Estado deve ter 2 caracteres (UF)"),
  zipCode: z.string().regex(zipCodeRegex, "CEP inválido (formato: 00000-000)"),
})

export const companyInfoSchema = z.object({
  name: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
  cnpj: z.string().regex(cnpjRegex, "CNPJ inválido (formato: 00.000.000/0000-00)"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(phoneRegex, "Telefone inválido (formato: (00) 00000-0000)"),
  address: addressSchema,
})

export const operatingHoursSchema = z
  .object({
    dayOfWeek: z.number().min(0).max(6),
    isOpen: z.boolean(),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
    breakStart: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)")
      .optional(),
    breakEnd: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.isOpen) return true
      return data.openTime < data.closeTime
    },
    {
      message: "Horário de abertura deve ser antes do fechamento",
      path: ["closeTime"],
    },
  )

export const serviceCategorySchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export const paymentMethodSchema = z.object({
  type: z.enum(["cash", "credit_card", "debit_card", "pix", "bank_transfer"]),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>
export type OperatingHoursFormData = z.infer<typeof operatingHoursSchema>
export type ServiceCategoryFormData = z.infer<typeof serviceCategorySchema>
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>
