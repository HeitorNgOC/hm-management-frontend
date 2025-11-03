import { apiClient } from "@/lib/api-client"
import type {
  Modality,
  GymClass,
  ClassEnrollment,
  CreateModalityRequest,
  UpdateModalityRequest,
  CreateGymClassRequest,
  UpdateGymClassRequest,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  ModalityFilters,
  GymClassFilters,
  EnrollmentFilters,
} from "@/lib/types/gym"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

export const modalityService = {
  getModalities: async (filters?: ModalityFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
    })

    const response = await apiClient.get<PaginatedResponse<Modality>>(`/gym/modalities?${params.toString()}`)
    return response.data
  },

  getModalityById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Modality>>(`/gym/modalities/${id}`)
    return response.data
  },

  createModality: async (data: CreateModalityRequest) => {
    const response = await apiClient.post<ApiResponse<Modality>>("/gym/modalities", data)
    return response.data
  },

  updateModality: async (id: string, data: UpdateModalityRequest) => {
    const response = await apiClient.patch<ApiResponse<Modality>>(`/gym/modalities/${id}`, data)
    return response.data
  },

  deleteModality: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/gym/modalities/${id}`)
    return response.data
  },
}

export const gymClassService = {
  getClasses: async (filters?: GymClassFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.modalityId && { modalityId: filters.modalityId }),
      ...(filters?.instructorId && { instructorId: filters.instructorId }),
      ...(filters?.status && { status: filters.status }),
    })

    const response = await apiClient.get<PaginatedResponse<GymClass>>(`/gym/classes?${params.toString()}`)
    return response.data
  },

  getClassById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<GymClass>>(`/gym/classes/${id}`)
    return response.data
  },

  createClass: async (data: CreateGymClassRequest) => {
    const response = await apiClient.post<ApiResponse<GymClass>>("/gym/classes", data)
    return response.data
  },

  updateClass: async (id: string, data: UpdateGymClassRequest) => {
    const response = await apiClient.patch<ApiResponse<GymClass>>(`/gym/classes/${id}`, data)
    return response.data
  },

  deleteClass: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/gym/classes/${id}`)
    return response.data
  },
}

export const enrollmentService = {
  getEnrollments: async (filters?: EnrollmentFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.classId && { classId: filters.classId }),
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.status && { status: filters.status }),
    })

    const response = await apiClient.get<PaginatedResponse<ClassEnrollment>>(`/gym/enrollments?${params.toString()}`)
    return response.data
  },

  getEnrollmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ClassEnrollment>>(`/gym/enrollments/${id}`)
    return response.data
  },

  createEnrollment: async (data: CreateEnrollmentRequest) => {
    const response = await apiClient.post<ApiResponse<ClassEnrollment>>("/gym/enrollments", data)
    return response.data
  },

  updateEnrollment: async (id: string, data: UpdateEnrollmentRequest) => {
    const response = await apiClient.patch<ApiResponse<ClassEnrollment>>(`/gym/enrollments/${id}`, data)
    return response.data
  },

  deleteEnrollment: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/gym/enrollments/${id}`)
    return response.data
  },
}
