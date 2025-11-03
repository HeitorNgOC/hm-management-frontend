export type WidgetType =
  | "revenue-chart"
  | "appointments-status"
  | "top-services"
  | "employee-performance"
  | "client-growth"
  | "inventory-status"
  | "low-stock-alert"
  | "appointments-timeline"
  | "revenue-by-service"
  | "client-distribution"
  | "stats-card"

export type WidgetSize = "small" | "medium" | "large" | "full"

export interface Widget {
  id: string
  type: WidgetType
  title: string
  size: WidgetSize
  position: number
  visible: boolean
  config?: Record<string, any>
}

export interface DashboardLayout {
  id: string
  userId: string
  widgets: Widget[]
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalAppointments: number
  appointmentsChange: number
  activeClients: number
  clientsChange: number
  lowStockItems: number
  stockChange: number
}
