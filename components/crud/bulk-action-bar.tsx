"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BulkAction {
  label: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  onClick: () => void
  isLoading?: boolean
}

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  actions: BulkAction[]
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
}: BulkActionBarProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-md border border-primary/20 bg-primary/5 px-4 py-3",
        "animate-in fade-in slide-in-from-top-2 duration-200",
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onSelectAll}
          className={cn(
            "text-sm font-medium cursor-pointer",
            isAllSelected ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {isAllSelected ? "Desselecionar tudo" : "Selecionar tudo"} ({selectedCount} de {totalCount})
        </button>
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "default"}
            size="sm"
            onClick={action.onClick}
            disabled={action.isLoading}
          >
            {action.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
