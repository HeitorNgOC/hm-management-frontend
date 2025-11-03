"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { marketingService } from "@/lib/services/marketing.service"
import { useToast } from "@/hooks/use-toast"
import type { MarketingFilters } from "@/lib/types/marketing"

export function useCampaigns(filters?: MarketingFilters, page = 1) {
  return useQuery({
    queryKey: ["campaigns", filters, page],
    queryFn: () => marketingService.campaigns.list(filters, page),
  })
}

export function useCreateCampaign() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => marketingService.campaigns.create(data),
    onSuccess: () => {
      toast({ title: "Campanha criada com sucesso" })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
    onError: () => {
      toast({ title: "Erro ao criar campanha", variant: "destructive" })
    },
  })
}

export function useUpdateCampaign() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => marketingService.campaigns.update(id, data),
    onSuccess: () => {
      toast({ title: "Campanha atualizada com sucesso" })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useDeleteCampaign() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => marketingService.campaigns.delete(id),
    onSuccess: () => {
      toast({ title: "Campanha removida com sucesso" })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useTemplates(page = 1) {
  return useQuery({
    queryKey: ["templates", page],
    queryFn: () => marketingService.templates.list(page),
  })
}

export function useCreateTemplate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => marketingService.templates.create(data),
    onSuccess: () => {
      toast({ title: "Template criado com sucesso" })
      queryClient.invalidateQueries({ queryKey: ["templates"] })
    },
  })
}

export function useCoupons(filters?: MarketingFilters, page = 1) {
  return useQuery({
    queryKey: ["coupons", filters, page],
    queryFn: () => marketingService.coupons.list(filters, page),
  })
}

export function useCreateCoupon() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => marketingService.coupons.create(data),
    onSuccess: () => {
      toast({ title: "Cupom criado com sucesso" })
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
    },
  })
}
