"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queueTicketService, queueDeskService } from "@/lib/services/queue.service"
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateDeskRequest,
  UpdateDeskRequest,
  CallNextRequest,
  QueueTicketFilters,
  QueueDeskFilters,
} from "@/lib/types/queue"
import { useToast } from "@/hooks/use-toast"

// Queue Ticket hooks
export const queueTicketKeys = {
  all: ["queue", "tickets"] as const,
  lists: () => [...queueTicketKeys.all, "list"] as const,
  list: (filters?: QueueTicketFilters, page?: number) => [...queueTicketKeys.lists(), { filters, page }] as const,
  details: () => [...queueTicketKeys.all, "detail"] as const,
  detail: (id: string) => [...queueTicketKeys.details(), id] as const,
  stats: (date?: string) => [...queueTicketKeys.all, "stats", date] as const,
}

export function useQueueTickets(filters?: QueueTicketFilters, page = 1, limit = 20) {
  return useQuery({
    queryKey: queueTicketKeys.list(filters, page),
    queryFn: () => queueTicketService.getTickets(filters, page, limit),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  })
}

export function useQueueTicket(id: string) {
  return useQuery({
    queryKey: queueTicketKeys.detail(id),
    queryFn: () => queueTicketService.getTicketById(id),
    enabled: !!id,
  })
}

export function useQueueStats(date?: string) {
  return useQuery({
    queryKey: queueTicketKeys.stats(date),
    queryFn: () => queueTicketService.getStats(date),
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => queueTicketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.stats() })
      toast({
        title: "Sucesso",
        description: "Senha gerada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao gerar senha",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketRequest }) => queueTicketService.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.stats() })
      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar senha",
        variant: "destructive",
      })
    },
  })
}

export function useCancelTicket() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => queueTicketService.cancelTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.stats() })
      toast({
        title: "Sucesso",
        description: "Senha cancelada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao cancelar senha",
        variant: "destructive",
      })
    },
  })
}

// Queue Desk hooks
export const queueDeskKeys = {
  all: ["queue", "desks"] as const,
  lists: () => [...queueDeskKeys.all, "list"] as const,
  list: (filters?: QueueDeskFilters, page?: number) => [...queueDeskKeys.lists(), { filters, page }] as const,
  details: () => [...queueDeskKeys.all, "detail"] as const,
  detail: (id: string) => [...queueDeskKeys.details(), id] as const,
}

export function useQueueDesks(filters?: QueueDeskFilters, page = 1, limit = 20) {
  return useQuery({
    queryKey: queueDeskKeys.list(filters, page),
    queryFn: () => queueDeskService.getDesks(filters, page, limit),
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export function useQueueDesk(id: string) {
  return useQuery({
    queryKey: queueDeskKeys.detail(id),
    queryFn: () => queueDeskService.getDeskById(id),
    enabled: !!id,
    refetchInterval: 3000, // Refetch every 3 seconds for desk status
  })
}

export function useCreateDesk() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateDeskRequest) => queueDeskService.createDesk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueDeskKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Guichê criado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar guichê",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateDesk() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeskRequest }) => queueDeskService.updateDesk(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queueDeskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueDeskKeys.detail(variables.id) })
      toast({
        title: "Sucesso",
        description: "Guichê atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar guichê",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteDesk() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => queueDeskService.deleteDesk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueDeskKeys.lists() })
      toast({
        title: "Sucesso",
        description: "Guichê removido com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover guichê",
        variant: "destructive",
      })
    },
  })
}

export function useCallNext() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CallNextRequest) => queueDeskService.callNext(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueDeskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.stats() })
      toast({
        title: "Sucesso",
        description: "Próximo cliente chamado",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao chamar próximo cliente",
        variant: "destructive",
      })
    },
  })
}

export function useCompleteService() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (deskId: string) => queueDeskService.completeService(deskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueDeskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: queueTicketKeys.stats() })
      toast({
        title: "Sucesso",
        description: "Atendimento finalizado",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao finalizar atendimento",
        variant: "destructive",
      })
    },
  })
}
