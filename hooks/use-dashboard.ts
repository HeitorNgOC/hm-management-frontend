"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardService } from "@/lib/services/dashboard.service"
import { ensureArray } from "@/lib/utils"
import type { Widget } from "@/lib/types/dashboard"
import { useToast } from "@/hooks/use-toast"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (startDate?: string, endDate?: string) => [...dashboardKeys.all, "stats", { startDate, endDate }] as const,
  revenue: (period: string) => [...dashboardKeys.all, "revenue", period] as const,
  appointmentsByStatus: () => [...dashboardKeys.all, "appointments-status"] as const,
  topServices: (limit: number) => [...dashboardKeys.all, "top-services", limit] as const,
  employeePerformance: (limit: number) => [...dashboardKeys.all, "employee-performance", limit] as const,
  clientGrowth: (period: string) => [...dashboardKeys.all, "client-growth", period] as const,
  inventoryStatus: () => [...dashboardKeys.all, "inventory-status"] as const,
  layout: () => [...dashboardKeys.all, "layout"] as const,
}

export function useDashboardStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: dashboardKeys.stats(startDate, endDate),
    queryFn: () => dashboardService.getStats(startDate, endDate),
  })
}

export function useRevenueData(period: "week" | "month" | "year" = "month") {
  return useQuery({
    queryKey: dashboardKeys.revenue(period),
    queryFn: () => dashboardService.getRevenueData(period),
    select: (data) => ensureArray(data),
  })
}

export function useAppointmentsByStatus() {
  return useQuery({
    queryKey: dashboardKeys.appointmentsByStatus(),
    queryFn: () => dashboardService.getAppointmentsByStatus(),
    select: (data) => ensureArray(data),
  })
}

export function useTopServices(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.topServices(limit),
    queryFn: () => dashboardService.getTopServices(limit),
    select: (data) => ensureArray(data),
  })
}

export function useEmployeePerformance(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.employeePerformance(limit),
    queryFn: () => dashboardService.getEmployeePerformance(limit),
    select: (data) => ensureArray(data),
  })
}

export function useClientGrowth(period: "week" | "month" | "year" = "month") {
  return useQuery({
    queryKey: dashboardKeys.clientGrowth(period),
    queryFn: () => dashboardService.getClientGrowth(period),
    select: (data) => ensureArray(data),
  })
}

export function useInventoryStatus() {
  return useQuery({
    queryKey: dashboardKeys.inventoryStatus(),
    queryFn: () => dashboardService.getInventoryStatus(),
  })
}

export function useDashboardLayout() {
  return useQuery({
    queryKey: dashboardKeys.layout(),
    queryFn: () => dashboardService.getLayout(),
  })
}

export function useSaveDashboardLayout() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (widgets: Widget[]) => dashboardService.saveLayout(widgets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.layout() })
      toast({
        title: "Sucesso",
        description: "Layout salvo com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar layout",
        variant: "destructive",
      })
    },
  })
}

export function useResetDashboardLayout() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => dashboardService.resetLayout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.layout() })
      toast({
        title: "Sucesso",
        description: "Layout restaurado para o padrão",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao restaurar layout",
        variant: "destructive",
      })
    },
  })
}
