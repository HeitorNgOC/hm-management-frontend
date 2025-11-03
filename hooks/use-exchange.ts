import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { exchangeService } from "@/lib/services/exchange.service"
import type { CreateExchangeRequest, UpdateExchangeRequest, ExchangeFilters } from "@/lib/types/exchange"
import { toast } from "@/hooks/use-toast"

export function useExchanges(page = 1, limit = 10, filters?: ExchangeFilters) {
  return useQuery({
    queryKey: ["exchanges", page, limit, filters],
    queryFn: () => exchangeService.getExchanges(page, limit, filters),
  })
}

export function useExchange(id: string) {
  return useQuery({
    queryKey: ["exchanges", id],
    queryFn: () => exchangeService.getExchange(id),
    enabled: !!id,
  })
}

export function useCreateExchange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExchangeRequest) => exchangeService.createExchange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchanges"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast({
        title: "Troca registrada",
        description: "A troca foi registrada com sucesso.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar troca",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useUpdateExchange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExchangeRequest }) => exchangeService.updateExchange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchanges"] })
      toast({
        title: "Troca atualizada",
        description: "A troca foi atualizada com sucesso.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar troca",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useCompleteExchange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => exchangeService.completeExchange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchanges"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      toast({
        title: "Troca concluída",
        description: "A troca foi concluída com sucesso.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao concluir troca",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useCancelExchange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => exchangeService.cancelExchange(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchanges"] })
      toast({
        title: "Troca cancelada",
        description: "A troca foi cancelada com sucesso.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar troca",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useExchangeStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["exchanges", "stats", startDate, endDate],
    queryFn: () => exchangeService.getExchangeStats(startDate, endDate),
  })
}
