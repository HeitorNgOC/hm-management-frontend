"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, User, Users } from "lucide-react"
import { useState, useMemo } from "react"
import { EmptyState } from "@/components/crud"
import { useClients, useDeleteClient } from "@/hooks/use-clients"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [clientType, setClientType] = useState<"all" | "individual" | "business">("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

  const { data: clients = [], isLoading } = useClients()

  const payload = clients as any
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : []

  const deleteClient = useDeleteClient()

  // Client-side filtering
  const filteredClients = useMemo(() => {
    let filtered = rows

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((c: any) => {
        const name = (c.name || "").toLowerCase()
        const email = (c.email || "").toLowerCase()
        const phone = (c.phone || "").toLowerCase()
        return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower)
      })
    }

    // Filter by client type
    if (clientType !== "all") {
      filtered = filtered.filter((c: any) => c.type === clientType)
    }

    return filtered
  }, [rows, search, clientType])

  const totalClients = filteredClients.length
  const totalSpent = filteredClients.reduce((sum: number, c: any) => sum + (c.totalSpent ?? 0), 0)
  const ticketAvg = totalClients ? totalSpent / totalClients : 0

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e histórico de vendas</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalClients}</p>
              <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Faturamento acumulado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {ticketAvg.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Por cliente</p>
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
                {filteredClients.map((client: any) => (
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
                        <p className="font-medium">R$ {(client.totalSpent ?? 0).toFixed(2)}</p>
                        <p className="text-muted-foreground">Total gasto</p>
                      </div>
                      <Badge variant={client.type === "individual" ? "default" : "secondary"}>
                        {client.type === "individual" ? "PF" : "PJ"}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => setEditingClientId(client.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeletingClientId(client.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <ClientFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

        {editingClientId && (
          <ClientFormDialog
            open={!!editingClientId}
            onOpenChange={(open) => !open && setEditingClientId(null)}
            clientId={editingClientId!}
            onSuccess={() => setEditingClientId(null)}
          />
        )}

        <AlertDialog open={!!deletingClientId} onOpenChange={(open) => !open && setDeletingClientId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingClientId) {
                    deleteClient.mutate(deletingClientId)
                    setDeletingClientId(null)
                  }
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
