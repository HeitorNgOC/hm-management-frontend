import { apiClient } from "@/lib/api-client"
import type {
  WorkoutTemplate,
  ClientWorkoutPlan,
  WorkoutLog,
  ClientProgress,
  CreateWorkoutTemplateRequest,
  UpdateWorkoutTemplateRequest,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  CreateWorkoutLogRequest,
  CreateProgressRequest,
  WorkoutTemplateFilters,
  WorkoutPlanFilters,
  WorkoutLogFilters,
  ProgressFilters,
} from "@/lib/types/workout"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

export const workoutTemplateService = {
  getTemplates: async (filters?: WorkoutTemplateFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
    })

    const response = await apiClient.get<PaginatedResponse<WorkoutTemplate>>(`/workout/templates?${params.toString()}`)
    return response.data
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get<WorkoutTemplate>(`/workout/templates/${id}`)
    return response.data
  },

  createTemplate: async (data: CreateWorkoutTemplateRequest) => {
    const response = await apiClient.post<WorkoutTemplate>("/workout/templates", data)
    return response.data
  },

  updateTemplate: async (id: string, data: UpdateWorkoutTemplateRequest) => {
    const response = await apiClient.patch<WorkoutTemplate>(`/workout/templates/${id}`, data)
    return response.data
  },

  deleteTemplate: async (id: string) => {
    const response = await apiClient.delete<void>(`/workout/templates/${id}`)
    return response.data
  },
}

export const workoutPlanService = {
  getPlans: async (filters?: WorkoutPlanFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.instructorId && { instructorId: filters.instructorId }),
      ...(filters?.status && { status: filters.status }),
    })

    const response = await apiClient.get<PaginatedResponse<ClientWorkoutPlan>>(`/workout/plans?${params.toString()}`)
    return response.data
  },

  getPlanById: async (id: string) => {
    const response = await apiClient.get<ClientWorkoutPlan>(`/workout/plans/${id}`)
    return response.data
  },

  createPlan: async (data: CreateWorkoutPlanRequest) => {
    const response = await apiClient.post<ClientWorkoutPlan>("/workout/plans", data)
    return response.data
  },

  updatePlan: async (id: string, data: UpdateWorkoutPlanRequest) => {
    const response = await apiClient.patch<ClientWorkoutPlan>(`/workout/plans/${id}`, data)
    return response.data
  },

  deletePlan: async (id: string) => {
    const response = await apiClient.delete<void>(`/workout/plans/${id}`)
    return response.data
  },
}

export const workoutLogService = {
  getLogs: async (filters?: WorkoutLogFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.workoutPlanId && { workoutPlanId: filters.workoutPlanId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    })

    const response = await apiClient.get<PaginatedResponse<WorkoutLog>>(`/workout/logs?${params.toString()}`)
    return response.data
  },

  getLogById: async (id: string) => {
    const response = await apiClient.get<WorkoutLog>(`/workout/logs/${id}`)
    return response.data
  },

  createLog: async (data: CreateWorkoutLogRequest) => {
    const response = await apiClient.post<WorkoutLog>("/workout/logs", data)
    return response.data
  },

  deleteLog: async (id: string) => {
    const response = await apiClient.delete<void>(`/workout/logs/${id}`)
    return response.data
  },
}

export const progressService = {
  getProgress: async (filters?: ProgressFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    })

    const response = await apiClient.get<PaginatedResponse<ClientProgress>>(`/workout/progress?${params.toString()}`)
    return response.data
  },

  getProgressById: async (id: string) => {
    const response = await apiClient.get<ClientProgress>(`/workout/progress/${id}`)
    return response.data
  },

  createProgress: async (data: CreateProgressRequest) => {
    const response = await apiClient.post<ClientProgress>("/workout/progress", data)
    return response.data
  },

  deleteProgress: async (id: string) => {
    const response = await apiClient.delete<void>(`/workout/progress/${id}`)
    return response.data
  },
}
