"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { subscriptionService } from "@/lib/services/subscription.service"
import type {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentRequest,
} from "@/lib/types/subscription"
import { useToast } from "@/hooks/use-toast"

export const subscriptionKeys = {
  all: ["subscription"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
  payments: (page?: number) => [...subscriptionKeys.all, "payments", { page }] as const,
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionService.getPlans(),
  })
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionService.getCurrentSubscription(),
  })
}

export function usePayments(page = 1, limit = 20) {
  return useQuery({
    queryKey: subscriptionKeys.payments(page),
    queryFn: () => subscriptionService.getPayments(page, limit),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => subscriptionService.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() })
      toast({ title: "Sucesso", description: "Assinatura criada com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar assinatura",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionRequest }) =>
      subscriptionService.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() })
      toast({ title: "Sucesso", description: "Assinatura atualizada com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar assinatura",
        variant: "destructive",
      })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => subscriptionService.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() })
      toast({ title: "Sucesso", description: "Assinatura cancelada" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao cancelar assinatura",
        variant: "destructive",
      })
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => subscriptionService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.payments() })
      toast({ title: "Sucesso", description: "Pagamento registrado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar pagamento",
        variant: "destructive",
      })
    },
  })
}
