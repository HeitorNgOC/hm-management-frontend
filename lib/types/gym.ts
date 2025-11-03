// Gym/Academia module types

export interface Modality {
  id: string
  companyId: string
  name: string
  description?: string
  color?: string
  icon?: string
  maxStudentsPerClass: number
  durationMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GymClass {
  id: string
  companyId: string
  modalityId: string
  modality?: Modality
  name: string
  description?: string
  instructorIds: string[]
  instructors?: Array<{
    id: string
    name: string
    avatar?: string
  }>
  schedule: ClassSchedule[]
  maxStudents: number
  currentStudents: number
  startDate: string
  endDate?: string
  status: ClassStatus
  createdAt: string
  updatedAt: string
}

export interface ClassSchedule {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export type ClassStatus = "active" | "inactive" | "full" | "cancelled"

export interface ClassEnrollment {
  id: string
  companyId: string
  classId: string
  class?: GymClass
  clientId: string
  client?: {
    id: string
    name: string
    email?: string
    phone: string
    avatar?: string
  }
  enrollmentDate: string
  status: EnrollmentStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type EnrollmentStatus = "active" | "inactive" | "suspended" | "cancelled"

export interface CreateModalityRequest {
  name: string
  description?: string
  color?: string
  icon?: string
  maxStudentsPerClass: number
  durationMinutes: number
}

export interface UpdateModalityRequest {
  name?: string
  description?: string
  color?: string
  icon?: string
  maxStudentsPerClass?: number
  durationMinutes?: number
  isActive?: boolean
}

export interface CreateGymClassRequest {
  modalityId: string
  name: string
  description?: string
  instructorIds: string[]
  schedule: ClassSchedule[]
  maxStudents: number
  startDate: string
  endDate?: string
}

export interface UpdateGymClassRequest {
  modalityId?: string
  name?: string
  description?: string
  instructorIds?: string[]
  schedule?: ClassSchedule[]
  maxStudents?: number
  startDate?: string
  endDate?: string
  status?: ClassStatus
}

export interface CreateEnrollmentRequest {
  classId: string
  clientId: string
  notes?: string
}

export interface UpdateEnrollmentRequest {
  status?: EnrollmentStatus
  notes?: string
}

export interface ModalityFilters {
  search?: string
  isActive?: boolean
}

export interface GymClassFilters {
  search?: string
  modalityId?: string
  instructorId?: string
  status?: ClassStatus
}

export interface EnrollmentFilters {
  search?: string
  classId?: string
  clientId?: string
  status?: EnrollmentStatus
}
