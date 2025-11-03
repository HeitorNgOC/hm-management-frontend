"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { employeeTimeIntervalService } from "@/lib/services/employee-time-interval.service"
import type { EmployeeTimeIntervalFilters } from "@/lib/types/employee-time-interval"
import { useToast } from "@/hooks/use-toast"

const QUERY_KEYS = {
  all: ["employee-time-intervals"],
  byEmployee: (employeeId: string) => [...QUERY_KEYS.all, "by-employee", employeeId],
}

export function useEmployeeTimeIntervals(filters?: EmployeeTimeIntervalFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.all, filters],
    queryFn: () => employeeTimeIntervalService.getAll(filters),
  })
}

export function useEmployeeTimeIntervalsByEmployeeId(employeeId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byEmployee(employeeId),
    queryFn: () => employeeTimeIntervalService.getByEmployeeId(employeeId),
  })
}

export function useCreateEmployeeTimeInterval() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeeTimeIntervalService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byEmployee(data.employeeId) })
      toast({
        title: "Sucesso",
        description: "Horário cadastrado com sucesso",
      })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar horário",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateEmployeeTimeInterval() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => employeeTimeIntervalService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byEmployee(data.employeeId) })
      toast({
        title: "Sucesso",
        description: "Horário atualizado com sucesso",
      })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar horário",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteEmployeeTimeInterval() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeeTimeIntervalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      toast({
        title: "Sucesso",
        description: "Horário removido com sucesso",
      })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover horário",
        variant: "destructive",
      })
    },
  })
}
