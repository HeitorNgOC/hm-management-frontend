"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Download, Eye, FileCheck } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"
import { Badge } from "@/components/ui/badge"

export default function NFSePage() {
  const [search, setSearch] = useState("")

  const nfses = [
    {
      id: 1,
      rps: "RPS-001",
      service: "Corte de Cabelo",
      client: "João Silva",
      amount: 150.0,
      issueDate: "2024-11-20",
      status: "issued" as const,
    },
    {
      id: 2,
      rps: "RPS-002",
      service: "Coloração",
      client: "Maria Santos",
      amount: 280.0,
      issueDate: "2024-11-21",
      status: "issued" as const,
    },
  ]

  const filteredNFses = nfses.filter(
    (n) => n.rps.toLowerCase().includes(search.toLowerCase()) || n.client.toLowerCase().includes(search.toLowerCase()),
  )

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    issued: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    error: "bg-orange-100 text-orange-800",
  }

  return (
    <ProtectedRoute requiredPermissions={["financial.edit"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas Fiscais de Serviço (NFSe)</h1>
            <p className="text-muted-foreground">Emita e gerencie suas notas fiscais de serviço</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Emitir NFSe
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Emitidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ 12.540,00</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notas Fiscais de Serviço</CardTitle>
                <CardDescription>Total: {filteredNFses.length} NFSes</CardDescription>
              </div>
              <Input
                placeholder="Buscar RPS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredNFses.length === 0 ? (
              <EmptyState
                title="Nenhuma NFSe emitida"
                description="Comece emitindo uma nova nota fiscal de serviço"
                actionLabel="Emitir NFSe"
              />
            ) : (
              <div className="space-y-2">
                {filteredNFses.map((nfse) => (
                  <div key={nfse.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <FileCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {nfse.rps} - {nfse.service}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {nfse.client} • {new Date(nfse.issueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[nfse.status]}>
                        {nfse.status === "issued" && "Emitida"}
                        {(nfse.status as string) === "draft" && "Rascunho"}
                        {(nfse.status as string) === "cancelled" && "Cancelada"}
                      </Badge>
                      <p className="font-bold">R$ {nfse.amount.toFixed(2)}</p>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
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
