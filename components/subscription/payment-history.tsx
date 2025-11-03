"use client"

import { useState } from "react"
import { usePayments } from "@/hooks/use-subscription"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function PaymentHistory() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePayments(page)

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "Pendente", variant: "secondary" as const },
      completed: { label: "Concluído", variant: "default" as const },
      failed: { label: "Falhou", variant: "destructive" as const },
      refunded: { label: "Reembolsado", variant: "outline" as const },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getMethodLabel = (method: string) => {
    const labels = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      pix: "PIX",
      boleto: "Boleto",
      cash: "Dinheiro",
    }
    return labels[method as keyof typeof labels] || method
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Histórico de Pagamentos</h3>

      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.createdAt), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{payment.description || "-"}</TableCell>
                    <TableCell>{getMethodLabel(payment.method)}</TableCell>
                    <TableCell className="font-medium">R$ {payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {data.pagination.currentPage} de {data.pagination.totalPages}
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
                  disabled={page === data.pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
