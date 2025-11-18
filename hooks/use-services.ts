"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { serviceService } from "@/lib/services/service.service"
import { useToast } from "@/hooks/use-toast"
import type { Service, CreateServiceRequest, UpdateServiceRequest } from "@/lib/types/service"

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (filters?: any) => [...serviceKeys.lists(), { filters }] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
}

export function useServices(filters?: any) {
  return useQuery({ queryKey: serviceKeys.list(filters), queryFn: () => serviceService.getAll(filters) })
}

export function useService(id?: string) {
  return useQuery({ queryKey: serviceKeys.detail(id || ""), queryFn: () => serviceService.getById(id || ""), enabled: !!id })
}

export function useCreateService() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.lists() })
      toast({ title: "Sucesso", description: "Serviço criado" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao criar serviço", variant: "destructive" })
    },
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) => serviceService.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: serviceKeys.lists() })
      qc.invalidateQueries({ queryKey: serviceKeys.detail(vars.id) })
      toast({ title: "Sucesso", description: "Serviço atualizado" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao atualizar serviço", variant: "destructive" })
    },
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.lists() })
      toast({ title: "Sucesso", description: "Serviço removido" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao remover serviço", variant: "destructive" })
    },
  })
}

export function useBulkDeleteService() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (ids: string[]) => serviceService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.lists() })
      toast({ title: "Sucesso", description: "Serviços removidos" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao remover serviços", variant: "destructive" })
    },
  })
}
