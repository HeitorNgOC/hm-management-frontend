"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { restaurantService } from "@/lib/services/restaurant.service"
import type {
  CreateTableRequest,
  UpdateTableRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  AddOrderItemRequest,
} from "@/lib/types/restaurant"
import { useToast } from "@/hooks/use-toast"

export const restaurantKeys = {
  tables: ["tables"] as const,
  orders: ["orders"] as const,
  ordersList: (page?: number, status?: string) => [...restaurantKeys.orders, "list", { page, status }] as const,
  orderDetail: (id: string) => [...restaurantKeys.orders, "detail", id] as const,
}

export function useTables() {
  return useQuery({
    queryKey: restaurantKeys.tables,
    queryFn: () => restaurantService.getTables(),
  })
}

export function useOrders(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: restaurantKeys.ordersList(page, status),
    queryFn: () => restaurantService.getOrders(page, limit, status),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: restaurantKeys.orderDetail(id),
    queryFn: () => restaurantService.getOrderById(id),
    enabled: !!id,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTableRequest) => restaurantService.createTable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.tables })
      toast({ title: "Sucesso", description: "Mesa criada com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar mesa",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateTable() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableRequest }) => restaurantService.updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.tables })
      toast({ title: "Sucesso", description: "Mesa atualizada com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar mesa",
        variant: "destructive",
      })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => restaurantService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.orders })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.tables })
      toast({ title: "Sucesso", description: "Pedido criado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar pedido",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) => restaurantService.updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.orders })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.orderDetail(variables.id) })
      toast({ title: "Sucesso", description: "Pedido atualizado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar pedido",
        variant: "destructive",
      })
    },
  })
}

export function useAddOrderItem() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: AddOrderItemRequest }) =>
      restaurantService.addOrderItem(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.orderDetail(variables.orderId) })
      toast({ title: "Sucesso", description: "Item adicionado ao pedido" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao adicionar item",
        variant: "destructive",
      })
    },
  })
}

export function useCloseOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => restaurantService.closeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.orders })
      queryClient.invalidateQueries({ queryKey: restaurantKeys.tables })
      toast({ title: "Sucesso", description: "Pedido fechado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao fechar pedido",
        variant: "destructive",
      })
    },
  })
}
