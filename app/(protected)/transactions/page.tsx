"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"

export default function TransactionsPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [type, setType] = useState<"all" | "income" | "expense">("all")

  const transactions = [
    {
      id: 1,
      type: "income" as const,
      category: "service",
      description: "Corte de Cabelo - João Silva",
      amount: 150.0,
      paymentMethod: "Dinheiro",
      date: "2024-11-21",
    },
    {
      id: 2,
      type: "expense" as const,
      category: "supplies",
      description: "Compra de produtos - Fornecedor ABC",
      amount: 800.0,
      paymentMethod: "Cartão",
      date: "2024-11-20",
    },
    {
      id: 3,
      type: "income" as const,
      category: "service",
      description: "Coloração - Maria Santos",
      amount: 280.0,
      paymentMethod: "Pix",
      date: "2024-11-20",
    },
  ]

  let filteredTransactions = transactions
  if (type !== "all") {
    filteredTransactions = filteredTransactions.filter((t) => t.type === type)
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  return (
    <ProtectedRoute requiredPermissions={["financial.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Histórico completo de todas as transações</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold">R$ {totalIncome.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-red-600" />
                <p className="text-2xl font-bold">R$ {totalExpense.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                R$ {(totalIncome - totalExpense).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>Total: {filteredTransactions.length} transações</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredTransactions.length === 0 ? (
              <EmptyState title="Nenhuma transação" description="Não há transações para o período selecionado" />
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          (transaction.type as string) === "income" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight
                            className={`h-5 w-5 ${(transaction.type as string) === "income" ? "text-green-600" : "text-red-600"}`}
                          />
                          ) : (
                          <ArrowDownLeft
                            className={`h-5 w-5 ${(transaction.type as string) === "income" ? "text-green-600" : "text-red-600"}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.paymentMethod} • {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-bold ${(transaction.type as string) === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {(transaction.type as string) === "income" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
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
