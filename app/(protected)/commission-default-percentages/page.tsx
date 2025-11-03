"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, Percent } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"

export default function CommissionDefaultPercentagesPage() {
  const [commissions, setCommissions] = useState([
    { id: 1, type: "service", name: "Corte de Cabelo", percentage: 15 },
    { id: 2, type: "service", name: "Coloração", percentage: 20 },
    { id: 3, type: "service", name: "Barboterapia", percentage: 10 },
  ])
  const [percentage, setPercentage] = useState("")
  const [description, setDescription] = useState("")

  const handleAddCommission = () => {
    if (percentage && description) {
      setCommissions([
        ...commissions,
        {
          id: commissions.length + 1,
          type: "service",
          name: description,
          percentage: Number.parseFloat(percentage),
        },
      ])
      setPercentage("")
      setDescription("")
    }
  }

  const handleDeleteCommission = (id: number) => {
    setCommissions(commissions.filter((c) => c.id !== id))
  }

  return (
    <ProtectedRoute requiredPermissions={["settings.edit"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Comissões Padrão</h1>
          <p className="text-muted-foreground">Configure os percentuais padrão de comissão por serviço</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Adicionar Comissão</CardTitle>
              <CardDescription>Crie um novo percentual padrão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Serviço</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Corte de Cabelo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage">Percentual (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="15"
                  />
                  <Button variant="outline" className="px-3 bg-transparent">
                    <Percent className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleAddCommission} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Comissões Configuradas</CardTitle>
              <CardDescription>Total: {commissions.length} comissões padrão</CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <EmptyState title="Nenhuma comissão" description="Adicione as comissões padrão para seus serviços" />
              ) : (
                <div className="space-y-2">
                  {commissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Percent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{commission.name}</p>
                          <p className="text-sm text-muted-foreground">{commission.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-blue-600">{commission.percentage}%</p>
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCommission(commission.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
