"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Target } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"

export default function GoalsPage() {
  const [goalType, setGoalType] = useState<"all" | "active" | "completed">("active")

  const goals = [
    {
      id: 1,
      name: "Receita de Novembro",
      target: 50000,
      current: 38500,
      category: "revenue",
      priority: "high",
      endDate: "2024-11-30",
      progress: 77,
    },
    {
      id: 2,
      name: "Novos Clientes",
      target: 100,
      current: 65,
      category: "customer_acquisition",
      priority: "medium",
      endDate: "2024-12-31",
      progress: 65,
    },
    {
      id: 3,
      name: "Redução de Despesas",
      target: 5000,
      current: 3200,
      category: "expense_reduction",
      priority: "critical",
      endDate: "2024-11-30",
      progress: 64,
    },
  ]

  const filteredGoals = goalType === "all" ? goals : goals.filter((g) => g.progress < 100)

  return (
    <ProtectedRoute requiredPermissions={["financial.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Metas</h1>
            <p className="text-muted-foreground">Acompanhe e gerencie as metas da sua empresa</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Metas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground mt-1">Em progresso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground mt-1">Este ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">80%</p>
              <p className="text-xs text-muted-foreground mt-1">Média geral</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Metas em Progresso</CardTitle>
                <CardDescription>Acompanhe o progresso de suas metas</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={goalType === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGoalType("active")}
                >
                  Ativas
                </Button>
                <Button
                  variant={goalType === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGoalType("completed")}
                >
                  Concluídas
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredGoals.length === 0 ? (
              <EmptyState
                title="Nenhuma meta"
                description="Crie uma nova meta para sua empresa"
                actionLabel="Nova Meta"
              />
            ) : (
              <div className="space-y-4">
                {filteredGoals.map((goal) => (
                  <div key={goal.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {goal.current.toLocaleString()} de {goal.target.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          goal.priority === "critical"
                            ? "bg-red-100 text-red-800"
                            : goal.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {goal.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={goal.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {goal.progress}% concluído • Até {new Date(goal.endDate).toLocaleDateString("pt-BR")}
                      </p>
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
