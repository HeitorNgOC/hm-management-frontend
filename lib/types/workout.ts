// Workout/Training module types

export interface WorkoutTemplate {
  id: string
  companyId: string
  name: string
  description?: string
  category: WorkoutCategory
  difficulty: WorkoutDifficulty
  exercises: WorkoutExercise[]
  estimatedDuration: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type WorkoutCategory = "strength" | "cardio" | "flexibility" | "functional" | "mixed"
export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced"

export interface WorkoutExercise {
  exerciseId: string
  exerciseName: string
  sets?: number
  reps?: number
  duration?: number // in seconds
  rest?: number // in seconds
  weight?: number
  notes?: string
  order: number
}

export interface ClientWorkoutPlan {
  id: string
  companyId: string
  clientId: string
  client?: {
    id: string
    name: string
    avatar?: string
  }
  instructorId: string
  instructor?: {
    id: string
    name: string
  }
  templateId?: string
  template?: WorkoutTemplate
  customExercises: WorkoutExercise[]
  startDate: string
  endDate?: string
  goal?: string
  notes?: string
  status: WorkoutPlanStatus
  createdAt: string
  updatedAt: string
}

export type WorkoutPlanStatus = "active" | "completed" | "cancelled"

export interface WorkoutLog {
  id: string
  companyId: string
  clientId: string
  workoutPlanId: string
  date: string
  exercises: LoggedExercise[]
  duration: number // in minutes
  notes?: string
  rating?: number // 1-5
  createdAt: string
}

export interface LoggedExercise {
  exerciseId: string
  exerciseName: string
  sets: LoggedSet[]
  notes?: string
}

export interface LoggedSet {
  setNumber: number
  reps?: number
  weight?: number
  duration?: number
  completed: boolean
}

export interface ClientProgress {
  id: string
  companyId: string
  clientId: string
  date: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  measurements?: BodyMeasurements
  photos?: string[]
  notes?: string
  createdAt: string
}

export interface BodyMeasurements {
  chest?: number
  waist?: number
  hips?: number
  biceps?: number
  thighs?: number
  calves?: number
}

export interface CreateWorkoutTemplateRequest {
  name: string
  description?: string
  category: WorkoutCategory
  difficulty: WorkoutDifficulty
  exercises: WorkoutExercise[]
  estimatedDuration: number
}

export interface UpdateWorkoutTemplateRequest {
  name?: string
  description?: string
  category?: WorkoutCategory
  difficulty?: WorkoutDifficulty
  exercises?: WorkoutExercise[]
  estimatedDuration?: number
  isActive?: boolean
}

export interface CreateWorkoutPlanRequest {
  clientId: string
  instructorId: string
  templateId?: string
  customExercises: WorkoutExercise[]
  startDate: string
  endDate?: string
  goal?: string
  notes?: string
}

export interface UpdateWorkoutPlanRequest {
  customExercises?: WorkoutExercise[]
  endDate?: string
  goal?: string
  notes?: string
  status?: WorkoutPlanStatus
}

export interface CreateWorkoutLogRequest {
  clientId: string
  workoutPlanId: string
  date: string
  exercises: LoggedExercise[]
  duration: number
  notes?: string
  rating?: number
}

export interface CreateProgressRequest {
  clientId: string
  date: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  measurements?: BodyMeasurements
  notes?: string
}

export interface WorkoutTemplateFilters {
  search?: string
  category?: WorkoutCategory
  difficulty?: WorkoutDifficulty
  isActive?: boolean
}

export interface WorkoutPlanFilters {
  search?: string
  clientId?: string
  instructorId?: string
  status?: WorkoutPlanStatus
}

export interface WorkoutLogFilters {
  clientId?: string
  workoutPlanId?: string
  startDate?: string
  endDate?: string
}

export interface ProgressFilters {
  clientId?: string
  startDate?: string
  endDate?: string
}
