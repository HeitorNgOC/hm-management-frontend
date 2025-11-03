"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
}

interface DataTableWrapperProps {
  title: string
  searchPlaceholder: string
  onSearch: (search: string) => void
  onAddNew: () => void
  isLoading?: boolean
  children: React.ReactNode
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
}

export function DataTableWrapper({
  title,
  searchPlaceholder,
  onSearch,
  onAddNew,
  isLoading,
  children,
  pagination,
  onPageChange,
}: DataTableWrapperProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button onClick={onAddNew} disabled={isLoading}>
          Novo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={searchPlaceholder} className="pl-9" onChange={(e) => onSearch(e.target.value)} />
      </div>

      <div className="rounded-md border overflow-hidden">{children}</div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.currentPage} de {pagination.totalPages} ({pagination.totalCount} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
