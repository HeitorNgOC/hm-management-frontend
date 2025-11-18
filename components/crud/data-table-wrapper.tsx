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

type Column = {
  key: string
  label: string
  render?: (row: any) => React.ReactNode
}

interface DataTableWrapperProps {
  title?: string
  searchPlaceholder?: string
  onSearch?: (search: string) => void
  onAddNew?: () => void
  isLoading?: boolean
  children?: React.ReactNode
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  // Backwards-compatible simple table rendering
  data?: any[]
  columns?: Column[]
  emptyMessage?: string
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
  data,
  columns,
  emptyMessage,
}: DataTableWrapperProps) {
  const safeOnSearch = onSearch ?? (() => {})
  const safeOnAddNew = onAddNew ?? (() => {})
  const safeTitle = title ?? ""
  const safeSearchPlaceholder = searchPlaceholder ?? "Pesquisar"
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{safeTitle}</h2>
        <Button onClick={safeOnAddNew} disabled={isLoading}>
          Novo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input placeholder={safeSearchPlaceholder} className="pl-9" onChange={(e) => safeOnSearch(e.target.value)} />
      </div>

      <div className="rounded-md border overflow-hidden">
        {columns && data ? (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-2 text-left">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={columns.length}>
                    {/** show optional emptyMessage or fallback */}
                    <span className="text-muted-foreground">{emptyMessage ?? "Nenhum registro encontrado"}</span>
                  </td>
                </tr>
              ) : (
                <>
                  {data.map((row, idx) => (
                    <tr key={row.id ?? idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/5"}>
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-2 align-top">
                          {col.render ? col.render(row) : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        ) : (
          children
        )}
      </div>

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
