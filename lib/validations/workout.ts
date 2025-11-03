import { z } from "zod"

export const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Selecione um exercício"),
  exerciseName: z.string().min(1, "Nome do exercício é obrigatório"),
  sets: z.number().min(1).max(10).optional(),
  reps: z.number().min(1).max(100).optional(),
  duration: z.number().min(1).optional(),
  rest: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  notes: z.string().optional(),
  order: z.number().min(0),
})

export const createWorkoutTemplateSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  category: z.enum(["strength", "cardio", "flexibility", "functional", "mixed"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  exercises: z.array(workoutExerciseSchema).min(1, "Adicione pelo menos um exercício"),
  estimatedDuration: z.number().min(5, "Duração mínima de 5 minutos"),
})

export const updateWorkoutTemplateSchema = createWorkoutTemplateSchema.partial()

export const createWorkoutPlanSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  instructorId: z.string().min(1, "Selecione um instrutor"),
  templateId: z.string().optional(),
  customExercises: z.array(workoutExerciseSchema),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
})

export const updateWorkoutPlanSchema = createWorkoutPlanSchema.partial()

export const loggedSetSchema = z.object({
  setNumber: z.number().min(1),
  reps: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  completed: z.boolean(),
})

export const loggedExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  sets: z.array(loggedSetSchema).min(1),
  notes: z.string().optional(),
})

export const createWorkoutLogSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  workoutPlanId: z.string().min(1, "Selecione um plano de treino"),
  date: z.string().min(1, "Data é obrigatória"),
  exercises: z.array(loggedExerciseSchema).min(1, "Registre pelo menos um exercício"),
  duration: z.number().min(1, "Duração deve ser maior que 0"),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

export const bodyMeasurementsSchema = z.object({
  chest: z.number().min(0).optional(),
  waist: z.number().min(0).optional(),
  hips: z.number().min(0).optional(),
  biceps: z.number().min(0).optional(),
  thighs: z.number().min(0).optional(),
  calves: z.number().min(0).optional(),
})

export const createProgressSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  date: z.string().min(1, "Data é obrigatória"),
  weight: z.number().min(0).optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).optional(),
  measurements: bodyMeasurementsSchema.optional(),
  notes: z.string().optional(),
})

export type CreateWorkoutTemplateFormData = z.infer<typeof createWorkoutTemplateSchema>
export type UpdateWorkoutTemplateFormData = z.infer<typeof updateWorkoutTemplateSchema>
export type CreateWorkoutPlanFormData = z.infer<typeof createWorkoutPlanSchema>
export type UpdateWorkoutPlanFormData = z.infer<typeof updateWorkoutPlanSchema>
export type CreateWorkoutLogFormData = z.infer<typeof createWorkoutLogSchema>
export type CreateProgressFormData = z.infer<typeof createProgressSchema>
