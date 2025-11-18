"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { useAppointmentsByStatus } from "@/hooks/use-dashboard"
import { ensureArray } from "@/lib/utils"
import { EmptyState } from "@/components/crud"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_COLORS = {
  scheduled: "hsl(var(--chart-1))",
  confirmed: "hsl(var(--chart-2))",
  in_progress: "hsl(var(--chart-3))",
  completed: "hsl(var(--chart-4))",
  cancelled: "hsl(var(--chart-5))",
  no_show: "hsl(220 14% 50%)",
}

const STATUS_LABELS = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não Compareceu",
}

export function AppointmentsStatusChart() {
  const { data, isLoading } = useAppointmentsByStatus()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const raw = ensureArray<any>(data)
  const chartData = raw.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    fill: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "hsl(var(--muted))",
  }))

  const chartConfig = Object.entries(STATUS_LABELS).reduce(
    (acc, [key, label]) => ({
      ...acc,
      [key]: {
        label,
        color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
      },
    }),
    {},
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Agendamentos</CardTitle>
        <CardDescription>Distribuição dos agendamentos por status</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <EmptyState title="Sem dados" description="Não há agendamentos para exibir." />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
