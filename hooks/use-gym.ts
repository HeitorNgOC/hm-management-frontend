"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { modalityService, gymClassService, enrollmentService } from "@/lib/services/gym.service"
import type {
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
import { useToast } from "@/hooks/use-toast"

// Modality hooks
export const modalityKeys = {
  all: ["gym", "modalities"] as const,
  lists: () => [...modalityKeys.all, "list"] as const,
  list: (filters?: ModalityFilters, page?: number) => [...modalityKeys.lists(), { filters, page }] as const,
  details: () => [...modalityKeys.all, "detail"] as const,
  detail: (id: string) => [...modalityKeys.details(), id] as const,
}

export function useModalities(filters?: ModalityFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: modalityKeys.list(filters, page),
    queryFn: () => modalityService.getModalities(filters, page, limit),
  })
}

export function useModality(id: string) {
  return useQuery({
    queryKey: modalityKeys.detail(id),
    queryFn: () => modalityService.getModalityById(id),
    enabled: !!id,
  })
}

export function useCreateModality() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateModalityRequest) => modalityService.createModality(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modalityKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Modalidade criada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar modalidade",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateModality() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModalityRequest }) => modalityService.updateModality(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: modalityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: modalityKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Modalidade atualizada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar modalidade",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteModality() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => modalityService.deleteModality(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modalityKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Modalidade removida com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover modalidade",
        variant: "destructive",
      })
    },
  })
}

// Gym Class hooks
export const gymClassKeys = {
  all: ["gym", "classes"] as const,
  lists: () => [...gymClassKeys.all, "list"] as const,
  list: (filters?: GymClassFilters, page?: number) => [...gymClassKeys.lists(), { filters, page }] as const,
  details: () => [...gymClassKeys.all, "detail"] as const,
  detail: (id: string) => [...gymClassKeys.details(), id] as const,
}

export function useGymClasses(filters?: GymClassFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: gymClassKeys.list(filters, page),
    queryFn: () => gymClassService.getClasses(filters, page, limit),
  })
}

export function useGymClass(id: string) {
  return useQuery({
    queryKey: gymClassKeys.detail(id),
    queryFn: () => gymClassService.getClassById(id),
    enabled: !!id,
  })
}

export function useCreateGymClass() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateGymClassRequest) => gymClassService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gymClassKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Turma criada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar turma",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateGymClass() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGymClassRequest }) => gymClassService.updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gymClassKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gymClassKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Turma atualizada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar turma",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteGymClass() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => gymClassService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gymClassKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Turma removida com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover turma",
        variant: "destructive",
      })
    },
  })
}

// Enrollment hooks
export const enrollmentKeys = {
  all: ["gym", "enrollments"] as const,
  lists: () => [...enrollmentKeys.all, "list"] as const,
  list: (filters?: EnrollmentFilters, page?: number) => [...enrollmentKeys.lists(), { filters, page }] as const,
  details: () => [...enrollmentKeys.all, "detail"] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
}

export function useEnrollments(filters?: EnrollmentFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: enrollmentKeys.list(filters, page),
    queryFn: () => enrollmentService.getEnrollments(filters, page, limit),
  })
}

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => enrollmentService.getEnrollmentById(id),
    enabled: !!id,
  })
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateEnrollmentRequest) => enrollmentService.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gymClassKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Inscrição realizada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao realizar inscrição",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEnrollmentRequest }) =>
      enrollmentService.updateEnrollment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: gymClassKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Inscrição atualizada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar inscrição",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => enrollmentService.deleteEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gymClassKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Inscrição removida com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover inscrição",
        variant: "destructive",
      })
    },
  })
}
