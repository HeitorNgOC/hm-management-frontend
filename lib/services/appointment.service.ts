import { apiClient } from "@/lib/api-client"
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
  AppointmentStatus,
} from "@/lib/types/appointment"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const appointmentService = {
  getAppointments: async (filters?: AppointmentFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.date && { date: filters.date }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.clientId && { clientId: filters.clientId }),
    })

    const response = await apiClient.get<PaginatedResponse<Appointment>>(`/appointments?${params.toString()}`)
    return response.data
  },

  getAppointmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`)
    return response.data
  },

  createAppointment: async (data: CreateAppointmentRequest) => {
    const response = await apiClient.post<ApiResponse<Appointment>>("/appointments", data)
    return response.data
  },

  updateAppointment: async (id: string, data: UpdateAppointmentRequest) => {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}`, data)
    return response.data
  },

  deleteAppointment: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/appointments/${id}`)
    return response.data
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status })
    return response.data
  },

  getAvailableSlots: async (employeeId: string, date: string, serviceId: string) => {
    const response = await apiClient.get<ApiResponse<string[]>>(
      `/appointments/available-slots?employeeId=${employeeId}&date=${date}&serviceId=${serviceId}`,
    )
    return response.data
  },
}

export { appointmentService }
