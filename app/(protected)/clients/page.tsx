"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, User, Users } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"
import { Badge } from "@/components/ui/badge"

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [clientType, setClientType] = useState<"all" | "individual" | "business">("all")

  const clients = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      phone: "(11) 98765-4321",
      type: "individual" as const,
      city: "São Paulo",
      totalSpent: 2400.0,
      appointmentsCount: 12,
      lastVisit: "2024-11-20",
      isActive: true,
    },
    {
      id: 2,
      name: "Empresa ABC Ltda",
      email: "contato@abc.com",
      phone: "(11) 3456-7890",
      type: "business" as const,
      city: "São Paulo",
      totalSpent: 8500.0,
      appointmentsCount: 5,
      lastVisit: "2024-11-18",
      isActive: true,
    },
    {
      id: 3,
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "(11) 91234-5678",
      type: "individual" as const,
      city: "São Paulo",
      totalSpent: 950.0,
      appointmentsCount: 4,
      lastVisit: "2024-11-10",
      isActive: true,
    },
  ]

  let filteredClients = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (clientType !== "all") {
    filteredClients = filteredClients.filter((c) => c.type === clientType)
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e histórico de vendas</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Clientes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {clients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {(clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{clients.reduce((sum, c) => sum + c.appointmentsCount, 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total de agendamentos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Total: {filteredClients.length} clientes</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <select
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value as any)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="individual">Pessoa Física</option>
                  <option value="business">Pessoa Jurídica</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredClients.length === 0 ? (
              <EmptyState
                title="Nenhum cliente encontrado"
                description="Comece adicionando um novo cliente"
                actionLabel="Novo Cliente"
              />
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        {client.type === "individual" ? (
                          <User className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Users className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email || client.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">R$ {client.totalSpent.toFixed(2)}</p>
                        <p className="text-muted-foreground">{client.appointmentsCount} agendamentos</p>
                      </div>
                      <Badge variant={client.type === "individual" ? "default" : "secondary"}>
                        {client.type === "individual" ? "PF" : "PJ"}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
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
    </ProtectedRoute>
  )
}
