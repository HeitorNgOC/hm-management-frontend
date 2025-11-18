"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { packageService } from "@/lib/services/package.service"
import { useToast } from "@/hooks/use-toast"
import type { Package, CreatePackageRequest, UpdatePackageRequest } from "@/lib/types/package"

export const packageKeys = {
  all: ["packages"] as const,
  lists: () => [...packageKeys.all, "list"] as const,
  list: (filters?: any) => [...packageKeys.lists(), { filters }] as const,
  details: () => [...packageKeys.all, "detail"] as const,
  detail: (id: string) => [...packageKeys.details(), id] as const,
}

export function usePackages(filters?: any) {
  return useQuery({ queryKey: packageKeys.list(filters), queryFn: () => packageService.getAll(filters) })
}

export function usePackage(id?: string) {
  return useQuery({ queryKey: packageKeys.detail(id || ""), queryFn: () => packageService.getById(id || ""), enabled: !!id })
}

export function useCreatePackage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: CreatePackageRequest) => packageService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: packageKeys.lists() })
      toast({ title: "Sucesso", description: "Pacote criado" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao criar pacote", variant: "destructive" })
    },
  })
}

export function useUpdatePackage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageRequest }) => packageService.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: packageKeys.lists() })
      qc.invalidateQueries({ queryKey: packageKeys.detail(vars.id) })
      toast({ title: "Sucesso", description: "Pacote atualizado" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao atualizar pacote", variant: "destructive" })
    },
  })
}

export function useDeletePackage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) => packageService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: packageKeys.lists() })
      toast({ title: "Sucesso", description: "Pacote removido" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao remover pacote", variant: "destructive" })
    },
  })
}

export function useBulkDeletePackage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (ids: string[]) => packageService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: packageKeys.lists() })
      toast({ title: "Sucesso", description: "Pacotes removidos" })
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.response?.data?.message || "Erro ao remover pacotes", variant: "destructive" })
    },
  })
}
