import { z } from "zod"

export const createCashRegisterSchema = z.object({
  openingBalance: z.number().min(0, "Saldo inicial não pode ser negativo"),
  notes: z.string().optional(),
})

export const closeCashRegisterSchema = z.object({
  closingBalance: z.number().min(0, "Saldo final não pode ser negativo"),
  notes: z.string().optional(),
})

export const createTransactionSchema = z.object({
  cashRegisterId: z.string().optional(),
  type: z.enum(["income", "expense"]),
  category: z.enum(["service", "product", "salary", "rent", "utilities", "supplies", "maintenance", "other"]),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  paymentMethod: z.string().min(1, "Selecione um método de pagamento"),
  description: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
})

export type CreateCashRegisterFormData = z.infer<typeof createCashRegisterSchema>
export type CloseCashRegisterFormData = z.infer<typeof closeCashRegisterSchema>
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>
