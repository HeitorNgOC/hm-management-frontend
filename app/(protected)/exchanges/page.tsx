"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/crud/data-table-wrapper"
import { ExchangeFormDialog } from "@/components/exchange/exchange-form-dialog"
import { useExchanges } from "@/hooks/use-exchange"
import type { Exchange, ExchangeFilters } from "@/lib/types/exchange"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  completed: { label: "Concluída", variant: "default" as const },
  cancelled: { label: "Cancelada", variant: "destructive" as const },
}

export default function ExchangesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ExchangeFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, isLoading } = useExchanges(page, 10, filters)

  const columns = [
    {
      key: "exchangeNumber",
      label: "Número",
      render: (exchange: Exchange) => <span className="font-medium">{exchange.exchangeNumber}</span>,
    },
    {
      key: "customerName",
      label: "Cliente",
    },
    {
      key: "originalItem",
      label: "Produto Original",
      render: (exchange: Exchange) => (
        <div>
          <div className="font-medium">{exchange.originalItem.name}</div>
          <div className="text-sm text-muted-foreground">
            {exchange.originalQuantity}x {formatCurrency(exchange.originalItem.sellPrice)}
          </div>
        </div>
      ),
    },
    {
      key: "newItem",
      label: "Novo Produto",
      render: (exchange: Exchange) => (
        <div>
          <div className="font-medium">{exchange.newItem.name}</div>
          <div className="text-sm text-muted-foreground">
            {exchange.newQuantity}x {formatCurrency(exchange.newItem.sellPrice)}
          </div>
        </div>
      ),
    },
    {
      key: "priceDifference",
      label: "Diferença",
      render: (exchange: Exchange) => (
        <span
          className={
            exchange.priceDifference > 0 ? "text-green-600" : exchange.priceDifference < 0 ? "text-red-600" : ""
          }
        >
          {formatCurrency(Math.abs(exchange.priceDifference))}
          {exchange.priceDifference > 0 && " (a pagar)"}
          {exchange.priceDifference < 0 && " (reembolso)"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (exchange: Exchange) => (
        <Badge variant={statusMap[exchange.status].variant}>{statusMap[exchange.status].label}</Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Data",
      render: (exchange: Exchange) =>
        format(new Date(exchange.createdAt), "dd/MM/yyyy HH:mm", {
          locale: ptBR,
        }),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trocas de Produtos</h1>
          <p className="text-muted-foreground">Gerencie as trocas de produtos da sua loja</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Troca
        </Button>
      </div>

      <DataTableWrapper
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          currentPage: data?.pagination?.page || 1,
          totalPages: data?.pagination?.totalPages || 1,
          totalCount: data?.pagination?.total || 0,
        }}
        onPageChange={setPage}
        emptyMessage="Nenhuma troca encontrada"
      />

      <ExchangeFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
