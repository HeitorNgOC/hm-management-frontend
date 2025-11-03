"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { positionService } from "@/lib/services/position.service"
import type { CreatePositionRequest, UpdatePositionRequest } from "@/lib/types/position"
import { useToast } from "@/hooks/use-toast"

export const positionKeys = {
  all: ["positions"] as const,
  lists: () => [...positionKeys.all, "list"] as const,
  list: (page?: number) => [...positionKeys.lists(), { page }] as const,
  details: () => [...positionKeys.all, "detail"] as const,
  detail: (id: string) => [...positionKeys.details(), id] as const,
}

export function usePositions(page = 1, limit = 50) {
  return useQuery({
    queryKey: positionKeys.list(page),
    queryFn: () => positionService.getPositions(page, limit),
  })
}

export function usePosition(id: string) {
  return useQuery({
    queryKey: positionKeys.detail(id),
    queryFn: () => positionService.getPositionById(id),
    enabled: !!id,
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePositionRequest) => positionService.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Cargo criado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar cargo",
        variant: "destructive",
      })
    },
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePositionRequest }) => positionService.updatePosition(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: positionKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Cargo atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar cargo",
        variant: "destructive",
      })
    },
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => positionService.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Cargo removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover cargo",
        variant: "destructive",
      })
    },
  })
}
