"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { iamService } from "@/lib/services/iam.service"
import { authService } from "@/lib/services/auth.service"
import type {
  Invitation,
  InvitationFilters,
  CreateInvitationRequest,
  AcceptInviteRequest,
} from "@/lib/types/iam"
import type { PaginatedResponse } from "@/lib/types/common"
import { useToast } from "@/hooks/use-toast"

export const iamKeys = {
  all: ["iam"] as const,
  invitations: () => [...iamKeys.all, "invitations"] as const,
  invitationList: (filters?: InvitationFilters, page?: number) =>
    [...iamKeys.invitations(), { filters, page }] as const,
  invitationDetails: () => [...iamKeys.invitations(), "detail"] as const,
  invitationDetail: (id: string) => [...iamKeys.invitationDetails(), id] as const,
}

export function useInvitations(filters?: InvitationFilters, page = 1, limit = 10) {
  return useQuery<PaginatedResponse<Invitation>>({
    queryKey: iamKeys.invitationList(filters, page),
    queryFn: () => iamService.listInvitations(filters, page, limit),
  })
}

export function useInvitation(id: string) {
  return useQuery({
    queryKey: iamKeys.invitationDetail(id),
    queryFn: () => iamService.getInvitationById(id),
    enabled: !!id,
  })
}

export function useCreateInvitation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => iamService.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: iamKeys.invitations() })
      toast({ title: "Convite enviado", description: "O convite foi enviado por email ao usuário." })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.response?.data?.message || "Não foi possível enviar o convite",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => iamService.deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: iamKeys.invitations() })
      toast({ title: "Convite removido", description: "O convite foi revogado com sucesso." })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover convite",
        description: error.response?.data?.message || "Não foi possível remover o convite",
        variant: "destructive",
      })
    },
  })
}

export function useResendInvitation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => iamService.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: iamKeys.invitations() })
      toast({ title: "Convite reenviado", description: "O email de convite foi reenviado." })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.response?.data?.message || "Não foi possível reenviar o convite",
        variant: "destructive",
      })
    },
  })
}

export function useAcceptInvite() {
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: AcceptInviteRequest) => authService.acceptInvite(data),
    onError: (error: any) => {
      toast({
        title: "Erro ao aceitar convite",
        description: error.response?.data?.message || "Não foi possível aceitar o convite",
        variant: "destructive",
      })
    },
  })
}
