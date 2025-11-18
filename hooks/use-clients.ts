"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientService } from "@/lib/services/client.service"
import { useToast } from "@/hooks/use-toast"
import type { Client, CreateClientRequest, UpdateClientRequest } from "@/lib/types/client"

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters?: any) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

export function useClients(filters?: any) {
  return useQuery({ queryKey: clientKeys.list(filters), queryFn: () => clientService.getAll(filters) })
}

export function useClient(id?: string) {
  return useQuery({ queryKey: clientKeys.detail(id || ""), queryFn: () => clientService.getById(id || ""), enabled: !!id })
}

export function useCreateClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      toast({ title: "Sucesso", description: "Cliente criado" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao criar cliente", variant: "destructive" })
    },
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) => clientService.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      qc.invalidateQueries({ queryKey: clientKeys.detail(vars.id) })
      toast({ title: "Sucesso", description: "Cliente atualizado" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao atualizar cliente", variant: "destructive" })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      toast({ title: "Sucesso", description: "Cliente removido" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao remover cliente", variant: "destructive" })
    },
  })
}

export function useBulkDeleteClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (ids: string[]) => clientService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      toast({ title: "Sucesso", description: "Clientes removidos" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao remover clientes", variant: "destructive" })
    },
  })
}
