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
  // Backwards-compatible props used in some call sites
  actionLabel?: string
  actionOnClick?: () => void
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

  // support legacy actionLabel/actionOnClick props by normalizing to `action`
  let finalAction = action
  // @ts-ignore - prefer explicit action prop, but fall back to legacy props if present
  if (!finalAction && (arguments[0] as any)?.actionLabel) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args: any = arguments[0]
    finalAction = { label: args.actionLabel, onClick: args.actionOnClick }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
      {finalAction && (
        <Button onClick={finalAction.onClick} variant="outline" size="sm">
          {finalAction.label}
        </Button>
      )}
    </div>
  )
}
