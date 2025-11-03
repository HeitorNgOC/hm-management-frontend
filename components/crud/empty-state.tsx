"use client"

import type React from "react"

import { AlertCircle, Package, Users, Calendar, Utensils, BarChart3, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

const iconMap: Record<string, React.ElementType> = {
  Users,
  Package,
  Calendar,
  Utensils,
  BarChart3,
  Zap,
  Clock,
  AlertCircle,
}

export function EmptyState({ icon = "AlertCircle", title, description, action }: EmptyStateProps) {
  const Icon = iconMap[icon] || AlertCircle

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}
