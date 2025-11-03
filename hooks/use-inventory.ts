"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventoryService } from "@/lib/services/inventory.service"
import type {
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  CreateMovementRequest,
  InventoryFilters,
} from "@/lib/types/inventory"
import { useToast } from "@/hooks/use-toast"

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (filters?: InventoryFilters, page?: number) => [...inventoryKeys.lists(), { filters, page }] as const,
  details: () => [...inventoryKeys.all, "detail"] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  movements: (itemId?: string, page?: number) => [...inventoryKeys.all, "movements", { itemId, page }] as const,
  lowStock: () => [...inventoryKeys.all, "low-stock"] as const,
}

export function useInventoryItems(filters?: InventoryFilters, page = 1, limit = 20) {
  return useQuery({
    queryKey: inventoryKeys.list(filters, page),
    queryFn: () => inventoryService.getItems(filters, page, limit),
  })
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryService.getItemById(id),
    enabled: !!id,
  })
}

export function useInventoryMovements(itemId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: inventoryKeys.movements(itemId, page),
    queryFn: () => inventoryService.getMovements(itemId, page, limit),
  })
}

export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStockItems(),
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      toast({ title: "Sucesso", description: "Item criado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar item",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemRequest }) =>
      inventoryService.updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) })
      toast({ title: "Sucesso", description: "Item atualizado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar item",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      toast({ title: "Sucesso", description: "Item removido com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover item",
        variant: "destructive",
      })
    },
  })
}

export function useCreateMovement() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateMovementRequest) => inventoryService.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast({ title: "Sucesso", description: "Movimentação registrada com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar movimentação",
        variant: "destructive",
      })
    },
  })
}
