"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { appointmentService } from "@/lib/services/appointment.service"
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
  AppointmentStatus,
} from "@/lib/types/appointment"
import { useToast } from "@/hooks/use-toast"

export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (filters?: AppointmentFilters, page?: number) => [...appointmentKeys.lists(), { filters, page }] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  availableSlots: (employeeId: string, date: string, serviceId: string) =>
    [...appointmentKeys.all, "slots", { employeeId, date, serviceId }] as const,
}

export function useAppointments(filters?: AppointmentFilters, page = 1, limit = 20) {
  return useQuery({
    queryKey: appointmentKeys.list(filters, page),
    queryFn: () => appointmentService.getAppointments(filters, page, limit),
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getAppointmentById(id),
    enabled: !!id,
  })
}

export function useAvailableSlots(employeeId: string, date: string, serviceId: string) {
  return useQuery({
    queryKey: appointmentKeys.availableSlots(employeeId, date, serviceId),
    queryFn: () => appointmentService.getAvailableSlots(employeeId, date, serviceId),
    enabled: !!employeeId && !!date && !!serviceId,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar agendamento",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentService.updateAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar agendamento",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentService.updateAppointmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar status",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => appointmentService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover agendamento",
        variant: "destructive",
      })
    },
  })
}
