import { apiClient } from "@/lib/api-client"
import type {
  EmployeeTimeInterval,
  CreateEmployeeTimeIntervalRequest,
  UpdateEmployeeTimeIntervalRequest,
  EmployeeTimeIntervalFilters,
} from "@/lib/types/employee-time-interval"

const employeeTimeIntervalService = {
  getAll: async (filters?: EmployeeTimeIntervalFilters) => {
    const response = await apiClient.get("/employee-time-intervals", { params: filters })
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as EmployeeTimeInterval[]
    if (Array.isArray(payload.data)) return payload.data as EmployeeTimeInterval[]
    if (Array.isArray(payload.items)) return payload.items as EmployeeTimeInterval[]
    return [] as EmployeeTimeInterval[]
  },

  getByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get(`/employee-time-intervals/employee/${employeeId}`)
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as EmployeeTimeInterval[]
    if (Array.isArray(payload.data)) return payload.data as EmployeeTimeInterval[]
    if (Array.isArray(payload.items)) return payload.items as EmployeeTimeInterval[]
    return [] as EmployeeTimeInterval[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/employee-time-intervals/${id}`)
    return response.data as EmployeeTimeInterval
  },

  create: async (data: CreateEmployeeTimeIntervalRequest) => {
    const response = await apiClient.post("/employee-time-intervals", data)
    return response.data as EmployeeTimeInterval
  },

  update: async (id: string, data: UpdateEmployeeTimeIntervalRequest) => {
    const response = await apiClient.put(`/employee-time-intervals/${id}`, data)
    return response.data as EmployeeTimeInterval
  },

  delete: async (id: string) => {
    await apiClient.delete(`/employee-time-intervals/${id}`)
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/employee-time-intervals/bulk-delete", { ids })
  },
}

export { employeeTimeIntervalService }
