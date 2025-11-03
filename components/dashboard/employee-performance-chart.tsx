"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useEmployeePerformance } from "@/hooks/use-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export function EmployeePerformanceChart() {
  const { data, isLoading } = useEmployeePerformance(5)

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

  const chartData = data || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance dos Funcionários</CardTitle>
        <CardDescription>Top 5 funcionários por agendamentos e receita</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            appointments: {
              label: "Agendamentos",
              color: "hsl(var(--chart-3))",
            },
            revenue: {
              label: "Receita",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar yAxisId="left" dataKey="appointments" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-4))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
