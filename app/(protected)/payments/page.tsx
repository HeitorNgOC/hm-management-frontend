"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreditCard, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { EmptyState } from "@/components/crud"

export default function PaymentsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", dateRange],
    queryFn: async () => {
      // TODO: Implement API call
      return []
    },
  })

  return (
    <ProtectedRoute requiredPermissions={["financial.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pagamentos</h1>
            <p className="text-muted-foreground">Histórico de pagamentos e transações</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <p className="text-2xl font-bold">R$ 12.540,00</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <p className="text-2xl font-bold">R$ 2.340,00</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">R$ 10.200,00</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Métodos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">5</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>Todas as transações financeiras</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input type="date" placeholder="Data Início" className="w-40" />
                <Input type="date" placeholder="Data Fim" className="w-40" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Carregando...</p>
            ) : !payments || payments.length === 0 ? (
              <EmptyState
                title="Nenhuma transação"
                description="Não há transações para o período selecionado"
                actionLabel="Adicionar Transação"
              />
            ) : (
              <div className="space-y-3">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">{payment.method}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${payment.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {payment.type === "income" ? "+" : "-"}R$ {payment.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
