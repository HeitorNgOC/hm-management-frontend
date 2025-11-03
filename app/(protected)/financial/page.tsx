"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function FinancialPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month")

  const revenueData = [
    { name: "Seg", revenue: 4000, expenses: 2400 },
    { name: "Ter", revenue: 3000, expenses: 1398 },
    { name: "Qua", revenue: 2000, expenses: 9800 },
    { name: "Qui", revenue: 2780, expenses: 3908 },
    { name: "Sex", revenue: 1890, expenses: 4800 },
    { name: "Sab", revenue: 2390, expenses: 3800 },
    { name: "Dom", revenue: 3490, expenses: 4300 },
  ]

  const categoryData = [
    { name: "Serviços", value: 45, fill: "#3b82f6" },
    { name: "Produtos", value: 30, fill: "#10b981" },
    { name: "Pacotes", value: 25, fill: "#f59e0b" },
  ]

  const paymentMethodData = [
    { name: "Dinheiro", value: 35 },
    { name: "Cartão", value: 45 },
    { name: "Pix", value: 20 },
  ]

  return (
    <ProtectedRoute requiredPermissions={["financial.view"]}>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatório Financeiro</h1>
            <p className="text-muted-foreground">Análise detalhada do desempenho financeiro</p>
          </div>
          <div className="flex gap-2">
            <Button variant={period === "month" ? "default" : "outline"} size="sm" onClick={() => setPeriod("month")}>
              Mês
            </Button>
            <Button
              variant={period === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("quarter")}
            >
              Trimestre
            </Button>
            <Button variant={period === "year" ? "default" : "outline"} size="sm" onClick={() => setPeriod("year")}>
              Ano
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">R$ 18.160,00</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% vs período anterior</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">R$ 7.308,00</p>
                  <p className="text-xs text-red-600 mt-1">+3.2% vs período anterior</p>
                </div>
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">R$ 10.852,00</p>
                  <p className="text-xs text-muted-foreground mt-1">59.7% de margem</p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ 24.560,00</p>
              <p className="text-xs text-muted-foreground mt-1">Saldo disponível</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Receita vs Despesas</CardTitle>
              <CardDescription>Comparativo por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Receita" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita por Categoria</CardTitle>
              <CardDescription>Distribuição de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de Receita</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Receita" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
