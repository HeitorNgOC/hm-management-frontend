import { apiClient } from "@/lib/api-client"
import type {
  MedicalRecord,
  Patient,
  PatientHistory,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreatePatientRequest,
  UpdatePatientRequest,
  MedicalRecordFilters,
  PatientFilters,
} from "@/lib/types/medical-record"
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

export const medicalRecordService = {
  getRecords: async (filters?: MedicalRecordFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.patientId && { patientId: filters.patientId }),
      ...(filters?.recordType && { recordType: filters.recordType }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    })

    const response = await apiClient.get<PaginatedResponse<MedicalRecord>>(`/medical-records?${params.toString()}`)
    return response.data
  },

  getRecordById: async (id: string) => {
    const response = await apiClient.get<MedicalRecord>(`/medical-records/${id}`)
    return response.data
  },

  createRecord: async (data: CreateMedicalRecordRequest) => {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>("/medical-records", data)
    return response.data
  },

  updateRecord: async (id: string, data: UpdateMedicalRecordRequest) => {
    const response = await apiClient.patch<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, data)
    return response.data
  },

  deleteRecord: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/medical-records/${id}`)
    return response.data
  },
}

export const patientService = {
  getPatients: async (filters?: PatientFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.species && { species: filters.species }),
      ...(filters?.ownerId && { ownerId: filters.ownerId }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
    })

    const response = await apiClient.get<PaginatedResponse<Patient>>(`/patients?${params.toString()}`)
    return response.data
  },

  getPatientById: async (id: string) => {
    const response = await apiClient.get<Patient>(`/patients/${id}`)
    return response.data
  },

  getPatientHistory: async (id: string) => {
    const response = await apiClient.get<PatientHistory>(`/patients/${id}/history`)
    return response.data
  },

  createPatient: async (data: CreatePatientRequest) => {
    const response = await apiClient.post<ApiResponse<Patient>>("/patients", data)
    return response.data
  },

  updatePatient: async (id: string, data: UpdatePatientRequest) => {
    const response = await apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, data)
    return response.data
  },

  deletePatient: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/patients/${id}`)
    return response.data
  },
}
