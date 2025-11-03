"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DollarSign, Calendar, Users, Package } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsStatusChart } from "@/components/dashboard/appointments-status-chart"
import { TopServicesChart } from "@/components/dashboard/top-services-chart"
import { EmployeePerformanceChart } from "@/components/dashboard/employee-performance-chart"
import { ClientGrowthChart } from "@/components/dashboard/client-growth-chart"
import { useDashboardStats } from "@/hooks/use-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Receita Total"
                value={stats?.totalRevenue || 0}
                change={stats?.revenueChange}
                icon={DollarSign}
                format="currency"
                iconColor="text-green-500"
              />
              <StatsCard
                title="Agendamentos"
                value={stats?.totalAppointments || 0}
                change={stats?.appointmentsChange}
                icon={Calendar}
                iconColor="text-blue-500"
              />
              <StatsCard
                title="Clientes Ativos"
                value={stats?.activeClients || 0}
                change={stats?.clientsChange}
                icon={Users}
                iconColor="text-purple-500"
              />
              <StatsCard
                title="Itens em Falta"
                value={stats?.lowStockItems || 0}
                change={stats?.stockChange}
                icon={Package}
                iconColor="text-orange-500"
              />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RevenueChart />
          <AppointmentsStatusChart />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TopServicesChart />
          <EmployeePerformanceChart />
        </div>

        <ClientGrowthChart />
      </div>
    </ProtectedRoute>
  )
}
