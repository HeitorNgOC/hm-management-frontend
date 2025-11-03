import { z } from "zod"

export const createModalitySchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  maxStudentsPerClass: z.number().min(1, "Deve ter no mínimo 1 aluno").max(100, "Máximo de 100 alunos"),
  durationMinutes: z.number().min(15, "Duração mínima de 15 minutos").max(480, "Duração máxima de 8 horas"),
})

export const updateModalitySchema = createModalitySchema.partial()

export const classScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:mm)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:mm)"),
})

export const createGymClassSchema = z.object({
  modalityId: z.string().min(1, "Selecione uma modalidade"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  instructorIds: z.array(z.string()).min(1, "Selecione pelo menos um instrutor"),
  schedule: z.array(classScheduleSchema).min(1, "Adicione pelo menos um horário"),
  maxStudents: z.number().min(1, "Deve ter no mínimo 1 aluno"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
})

export const updateGymClassSchema = createGymClassSchema.partial()

export const createEnrollmentSchema = z.object({
  classId: z.string().min(1, "Selecione uma turma"),
  clientId: z.string().min(1, "Selecione um cliente"),
  notes: z.string().optional(),
})

export const updateEnrollmentSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "cancelled"]).optional(),
  notes: z.string().optional(),
})

export type CreateModalityFormData = z.infer<typeof createModalitySchema>
export type UpdateModalityFormData = z.infer<typeof updateModalitySchema>
export type CreateGymClassFormData = z.infer<typeof createGymClassSchema>
export type UpdateGymClassFormData = z.infer<typeof updateGymClassSchema>
export type CreateEnrollmentFormData = z.infer<typeof createEnrollmentSchema>
export type UpdateEnrollmentFormData = z.infer<typeof updateEnrollmentSchema>
