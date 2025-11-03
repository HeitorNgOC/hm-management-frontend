"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { financialService } from "@/lib/services/financial.service"
import type {
  CreateCashRegisterRequest,
  CloseCashRegisterRequest,
  CreateTransactionRequest,
  TransactionFilters,
} from "@/lib/types/financial"
import { useToast } from "@/hooks/use-toast"

export const financialKeys = {
  all: ["financial"] as const,
  cashRegister: () => [...financialKeys.all, "cash-register"] as const,
  currentCashRegister: () => [...financialKeys.cashRegister(), "current"] as const,
  cashRegisterHistory: (page?: number) => [...financialKeys.cashRegister(), "history", { page }] as const,
  transactions: () => [...financialKeys.all, "transactions"] as const,
  transactionsList: (filters?: TransactionFilters, page?: number) =>
    [...financialKeys.transactions(), "list", { filters, page }] as const,
  summary: (startDate: string, endDate: string) => [...financialKeys.all, "summary", { startDate, endDate }] as const,
}

export function useCurrentCashRegister() {
  return useQuery({
    queryKey: financialKeys.currentCashRegister(),
    queryFn: () => financialService.getCurrentCashRegister(),
  })
}

export function useCashRegisterHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: financialKeys.cashRegisterHistory(page),
    queryFn: () => financialService.getCashRegisters(page, limit),
  })
}

export function useTransactions(filters?: TransactionFilters, page = 1, limit = 20) {
  return useQuery({
    queryKey: financialKeys.transactionsList(filters, page),
    queryFn: () => financialService.getTransactions(filters, page, limit),
  })
}

export function useFinancialSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: financialKeys.summary(startDate, endDate),
    queryFn: () => financialService.getFinancialSummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

export function useOpenCashRegister() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateCashRegisterRequest) => financialService.openCashRegister(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.currentCashRegister() })
      toast({ title: "Sucesso", description: "Caixa aberto com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao abrir caixa",
        variant: "destructive",
      })
    },
  })
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseCashRegisterRequest }) =>
      financialService.closeCashRegister(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.cashRegister() })
      toast({ title: "Sucesso", description: "Caixa fechado com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao fechar caixa",
        variant: "destructive",
      })
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => financialService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: financialKeys.currentCashRegister() })
      toast({ title: "Sucesso", description: "Transação registrada com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar transação",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => financialService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.transactions() })
      toast({ title: "Sucesso", description: "Transação removida com sucesso" })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover transação",
        variant: "destructive",
      })
    },
  })
}
