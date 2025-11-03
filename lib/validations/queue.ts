import { z } from "zod"

export const createTicketSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  serviceType: z.string().min(1, "Selecione o tipo de serviço"),
  priority: z.enum(["normal", "priority", "urgent"]).default("normal"),
  notes: z.string().optional(),
})

export const updateTicketSchema = z.object({
  status: z.enum(["waiting", "called", "in_service", "completed", "cancelled", "no_show"]).optional(),
  attendantId: z.string().optional(),
  deskNumber: z.string().optional(),
  notes: z.string().optional(),
})

export const createDeskSchema = z.object({
  deskNumber: z.string().min(1, "Número do guichê é obrigatório"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  serviceTypes: z.array(z.string()).min(1, "Selecione pelo menos um tipo de serviço"),
  attendantId: z.string().optional(),
})

export const updateDeskSchema = createDeskSchema.partial()

export const callNextSchema = z.object({
  deskId: z.string().min(1, "Selecione um guichê"),
  serviceType: z.string().optional(),
})

export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>
export type CreateDeskFormData = z.infer<typeof createDeskSchema>
export type UpdateDeskFormData = z.infer<typeof updateDeskSchema>
export type CallNextFormData = z.infer<typeof callNextSchema>
