"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { workoutTemplateService, workoutPlanService, progressService } from "@/lib/services/workout.service"
import type {
  CreateWorkoutTemplateRequest,
  UpdateWorkoutTemplateRequest,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  CreateProgressRequest,
  WorkoutTemplateFilters,
  WorkoutPlanFilters,
  ProgressFilters,
} from "@/lib/types/workout"
import { useToast } from "@/hooks/use-toast"

// Workout Template hooks
export const workoutTemplateKeys = {
  all: ["workout", "templates"] as const,
  lists: () => [...workoutTemplateKeys.all, "list"] as const,
  list: (filters?: WorkoutTemplateFilters, page?: number) =>
    [...workoutTemplateKeys.lists(), { filters, page }] as const,
  details: () => [...workoutTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutTemplateKeys.details(), id] as const,
}

export function useWorkoutTemplates(filters?: WorkoutTemplateFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: workoutTemplateKeys.list(filters, page),
    queryFn: () => workoutTemplateService.getTemplates(filters, page, limit),
  })
}

export function useWorkoutTemplate(id: string) {
  return useQuery({
    queryKey: workoutTemplateKeys.detail(id),
    queryFn: () => workoutTemplateService.getTemplateById(id),
    enabled: !!id,
  })
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateWorkoutTemplateRequest) => workoutTemplateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Modelo de treino criado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar modelo de treino",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutTemplateRequest }) =>
      workoutTemplateService.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Modelo de treino atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar modelo de treino",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => workoutTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Modelo de treino removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover modelo de treino",
        variant: "destructive",
      })
    },
  })
}

// Workout Plan hooks
export const workoutPlanKeys = {
  all: ["workout", "plans"] as const,
  lists: () => [...workoutPlanKeys.all, "list"] as const,
  list: (filters?: WorkoutPlanFilters, page?: number) => [...workoutPlanKeys.lists(), { filters, page }] as const,
  details: () => [...workoutPlanKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutPlanKeys.details(), id] as const,
}

export function useWorkoutPlans(filters?: WorkoutPlanFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: workoutPlanKeys.list(filters, page),
    queryFn: () => workoutPlanService.getPlans(filters, page, limit),
  })
}

export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: workoutPlanKeys.detail(id),
    queryFn: () => workoutPlanService.getPlanById(id),
    enabled: !!id,
  })
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateWorkoutPlanRequest) => workoutPlanService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutPlanKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Plano de treino criado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar plano de treino",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutPlanRequest }) =>
      workoutPlanService.updatePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workoutPlanKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Plano de treino atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar plano de treino",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => workoutPlanService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutPlanKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Plano de treino removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover plano de treino",
        variant: "destructive",
      })
    },
  })
}

// Progress hooks
export const progressKeys = {
  all: ["workout", "progress"] as const,
  lists: () => [...progressKeys.all, "list"] as const,
  list: (filters?: ProgressFilters, page?: number) => [...progressKeys.lists(), { filters, page }] as const,
  details: () => [...progressKeys.all, "detail"] as const,
  detail: (id: string) => [...progressKeys.details(), id] as const,
}

export function useProgress(filters?: ProgressFilters, page = 1, limit = 10) {
  return useQuery({
    queryKey: progressKeys.list(filters, page),
    queryFn: () => progressService.getProgress(filters, page, limit),
  })
}

export function useCreateProgress() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateProgressRequest) => progressService.createProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Evolução registrada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar evolução",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteProgress() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => progressService.deleteProgress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Registro de evolução removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover registro",
        variant: "destructive",
      })
    },
  })
}
