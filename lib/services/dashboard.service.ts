import { apiClient } from "@/lib/api-client"
import type { DashboardStats, DashboardLayout, Widget } from "@/lib/types/dashboard"

const dashboardService = {
  getStats: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get("/dashboard/stats", {
      params: { startDate, endDate },
    })
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter estatísticas do dashboard'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as DashboardStats
  },

  getRevenueData: async (period: "week" | "month" | "year") => {
    const response = await apiClient.get("/dashboard/revenue", {
      params: { period },
    })
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter receita'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as Array<{ date: string; revenue: number; appointments: number }>
  },

  getAppointmentsByStatus: async () => {
    const response = await apiClient.get("/dashboard/appointments-by-status")
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter status de agendamentos'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as Array<{ status: string; count: number; percentage: number }>
  },

  getTopServices: async (limit = 5) => {
    const response = await apiClient.get("/dashboard/top-services", {
      params: { limit },
    })
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter serviços mais vendidos'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as Array<{ name: string; revenue: number; count: number }>
  },

  getEmployeePerformance: async (limit = 5) => {
    const response = await apiClient.get("/dashboard/employee-performance", {
      params: { limit },
    })
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter performance de funcionários'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as Array<{ name: string; appointments: number; revenue: number }>
  },

  getClientGrowth: async (period: "week" | "month" | "year") => {
    const response = await apiClient.get("/dashboard/client-growth", {
      params: { period },
    })
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter crescimento de clientes'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as Array<{ date: string; newClients: number; totalClients: number }>
  },

  getInventoryStatus: async () => {
    const response = await apiClient.get("/dashboard/inventory-status")
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter status do estoque'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as {
      inStock: number
      lowStock: number
      outOfStock: number
      totalValue: number
    }
  },

  // Custom Dashboard Layout
  getLayout: async () => {
    const response = await apiClient.get("/dashboard/layout")
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao obter layout do dashboard'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as DashboardLayout
  },

  saveLayout: async (widgets: Widget[]) => {
    const response = await apiClient.post("/dashboard/layout", { widgets })
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao salvar layout do dashboard'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as DashboardLayout
  },

  resetLayout: async () => {
    const response = await apiClient.delete("/dashboard/layout")
    if (!response || (response.status && response.status >= 400)) {
      const message = response?.data?.message || 'Erro ao restaurar layout do dashboard'
      const err: any = new Error(message)
      err.response = response
      throw err
    }
    return response.data as DashboardLayout
  },
}

export { dashboardService }
