export interface Appointment {
  id: string
  companyId: string
  clientId: string
  client: Client
  employeeId: string
  employee: {
    id: string
    name: string
    avatar?: string
  }
  serviceId: string
  service: Service
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes?: string
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone: string
  cpf?: string
  avatar?: string
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  categoryId: string
}

export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"

export interface CreateAppointmentRequest {
  clientId: string
  employeeId: string
  serviceId: string
  date: string
  startTime: string
  notes?: string
}

export interface UpdateAppointmentRequest {
  clientId?: string
  employeeId?: string
  serviceId?: string
  date?: string
  startTime?: string
  status?: AppointmentStatus
  notes?: string
}

export interface AppointmentFilters {
  date?: string
  employeeId?: string
  status?: AppointmentStatus
  clientId?: string
}
