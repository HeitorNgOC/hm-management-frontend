"use client"

import { useState } from "react"
import { useTransactions, useDeleteTransaction } from "@/hooks/use-financial"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { TransactionDialog } from "./transaction-dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { TransactionFilters } from "@/lib/types/financial"

export function TransactionList() {
  const [page, setPage] = useState(1)
  const [filters] = useState<TransactionFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, isLoading } = useTransactions(filters, page)
  const deleteTransaction = useDeleteTransaction()

  const payload = data as any
  const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.items ?? []

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta transação?")) {
      await deleteTransaction.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transações</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              rows.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>
                    {transaction.type === "income" ? (
                      <Badge variant="default" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Entrada
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Saída
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{transaction.category}</TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell
                    className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDelete(transaction.id)} className="text-destructive">
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && (payload?.pagination?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {payload?.pagination?.page ?? page} de {payload?.pagination?.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === (payload?.pagination?.totalPages ?? 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <TransactionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />
    </div>
  )
}
