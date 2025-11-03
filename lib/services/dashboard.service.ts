import { apiClient } from "@/lib/api-client"
import type { DashboardStats, DashboardLayout, Widget } from "@/lib/types/dashboard"

const dashboardService = {
  getStats: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get("/dashboard/stats", {
      params: { startDate, endDate },
    })
    return response.data as DashboardStats
  },

  getRevenueData: async (period: "week" | "month" | "year") => {
    const response = await apiClient.get("/dashboard/revenue", {
      params: { period },
    })
    return response.data as Array<{ date: string; revenue: number; appointments: number }>
  },

  getAppointmentsByStatus: async () => {
    const response = await apiClient.get("/dashboard/appointments-by-status")
    return response.data as Array<{ status: string; count: number; percentage: number }>
  },

  getTopServices: async (limit = 5) => {
    const response = await apiClient.get("/dashboard/top-services", {
      params: { limit },
    })
    return response.data as Array<{ name: string; revenue: number; count: number }>
  },

  getEmployeePerformance: async (limit = 5) => {
    const response = await apiClient.get("/dashboard/employee-performance", {
      params: { limit },
    })
    return response.data as Array<{ name: string; appointments: number; revenue: number }>
  },

  getClientGrowth: async (period: "week" | "month" | "year") => {
    const response = await apiClient.get("/dashboard/client-growth", {
      params: { period },
    })
    return response.data as Array<{ date: string; newClients: number; totalClients: number }>
  },

  getInventoryStatus: async () => {
    const response = await apiClient.get("/dashboard/inventory-status")
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
    return response.data as DashboardLayout
  },

  saveLayout: async (widgets: Widget[]) => {
    const response = await apiClient.post("/dashboard/layout", { widgets })
    return response.data as DashboardLayout
  },

  resetLayout: async () => {
    const response = await apiClient.delete("/dashboard/layout")
    return response.data as DashboardLayout
  },
}

export { dashboardService }
