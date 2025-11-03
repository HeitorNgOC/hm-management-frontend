"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, type LucideIcon } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  format?: "currency" | "number" | "percentage"
  iconColor?: string
}

export function StatsCard({ title, value, change, icon: Icon, format = "number", iconColor }: StatsCardProps) {
  const formattedValue =
    format === "currency"
      ? formatCurrency(Number(value))
      : format === "percentage"
        ? `${value}%`
        : value.toLocaleString()

  const isPositive = change !== undefined && change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColor || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-500" />
            )}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>
              {Math.abs(change)}% em relação ao período anterior
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
