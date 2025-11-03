import { z } from "zod"

export const createAppointmentSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  employeeId: z.string().min(1, "Selecione um profissional"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido. Use o formato HH:MM"),
  notes: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  clientId: z.string().optional(),
  employeeId: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().optional(),
})

export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>
