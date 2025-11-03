"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PercentIcon } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"

export default function CommissionsPage() {
  const [search, setSearch] = useState("")

  const commissions = [
    { id: 1, employee: "João Silva", amount: 1200, percentage: 10, period: "Novembro 2024" },
    { id: 2, employee: "Maria Santos", amount: 950, percentage: 10, period: "Novembro 2024" },
    { id: 3, employee: "Pedro Oliveira", amount: 2100, percentage: 15, period: "Novembro 2024" },
  ]

  const filteredCommissions = commissions.filter((c) => c.employee.toLowerCase().includes(search.toLowerCase()))

  return (
    <ProtectedRoute requiredPermissions={["financial.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Comissões</h1>
          <p className="text-muted-foreground">Acompanhe as comissões dos funcionários</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ 4.250,00</p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{commissions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Com comissão ativa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Comissão Média</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">11,7%</p>
              <p className="text-xs text-muted-foreground mt-1">Percentual médio</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Comissões Ativas</CardTitle>
                <CardDescription>Novembro 2024</CardDescription>
              </div>
              <Input
                placeholder="Buscar funcionário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredCommissions.length === 0 ? (
              <EmptyState title="Nenhuma comissão encontrada" description="Não há registros para o período" />
            ) : (
              <div className="space-y-3">
                {filteredCommissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <PercentIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{commission.employee}</p>
                        <p className="text-sm text-muted-foreground">
                          {commission.percentage}% • {commission.period}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">R$ {commission.amount.toFixed(2)}</p>
                    </div>
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
