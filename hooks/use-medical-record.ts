"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { medicalRecordService, patientService } from "@/lib/services/medical-record.service"
import type {
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreatePatientRequest,
  UpdatePatientRequest,
  MedicalRecordFilters,
  PatientFilters,
} from "@/lib/types/medical-record"
import { useToast } from "@/hooks/use-toast"

// Medical Record hooks
export const medicalRecordKeys = {
  all: ["medical-records"] as const,
  lists: () => [...medicalRecordKeys.all, "list"] as const,
  list: (filters?: MedicalRecordFilters, page?: number) => [...medicalRecordKeys.lists(), { filters, page }] as const,
  details: () => [...medicalRecordKeys.all, "detail"] as const,
  detail: (id: string) => [...medicalRecordKeys.details(), id] as const,
}

export function useMedicalRecords(filters?: MedicalRecordFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: medicalRecordKeys.list(filters, page),
    queryFn: () => medicalRecordService.getRecords(filters, page, limit),
  })
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: () => medicalRecordService.getRecordById(id),
    enabled: !!id,
  })
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateMedicalRecordRequest) => medicalRecordService.createRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Prontuário criado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar prontuário",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordRequest }) =>
      medicalRecordService.updateRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() })
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Prontuário atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar prontuário",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => medicalRecordService.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Prontuário removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover prontuário",
        variant: "destructive",
      })
    },
  })
}

// Patient hooks
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (filters?: PatientFilters, page?: number) => [...patientKeys.lists(), { filters, page }] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  history: (id: string) => [...patientKeys.all, "history", id] as const,
}

export function usePatients(filters?: PatientFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: patientKeys.list(filters, page),
    queryFn: () => patientService.getPatients(filters, page, limit),
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getPatientById(id),
    enabled: !!id,
  })
}

export function usePatientHistory(id: string) {
  return useQuery({
    queryKey: patientKeys.history(id),
    queryFn: () => patientService.getPatientHistory(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Paciente cadastrado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao cadastrar paciente",
        variant: "destructive",
      })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) => patientService.updatePatient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Paciente atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar paciente",
        variant: "destructive",
      })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Paciente removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover paciente",
        variant: "destructive",
      })
    },
  })
}
