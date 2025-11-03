"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useClientGrowth } from "@/hooks/use-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface ClientGrowthChartProps {
  period?: "week" | "month" | "year"
}

export function ClientGrowthChart({ period = "month" }: ClientGrowthChartProps) {
  const { data, isLoading } = useClientGrowth(period)

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
        <CardTitle>Crescimento de Clientes</CardTitle>
        <CardDescription>Novos clientes ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            newClients: {
              label: "Novos Clientes",
              color: "hsl(var(--chart-5))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="newClients" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
