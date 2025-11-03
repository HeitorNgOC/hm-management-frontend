"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, Phone, Mail, MapPin } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"

export default function SuppliersPage() {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const suppliers = [
    {
      id: 1,
      name: "Fornecedor ABC",
      email: "contato@abc.com",
      phone: "(11) 98765-4321",
      address: "Rua Principal, 123",
      city: "São Paulo",
      isActive: true,
    },
    {
      id: 2,
      name: "Distribuição XYZ",
      email: "vendas@xyz.com",
      phone: "(11) 91234-5678",
      address: "Av. Secundária, 456",
      city: "São Paulo",
      isActive: true,
    },
  ]

  const filteredSuppliers = suppliers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredPermissions={["inventory.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie seus fornecedores e contatos</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Fornecedores</CardTitle>
                <CardDescription>Total: {filteredSuppliers.length} fornecedores</CardDescription>
              </div>
              <Input
                placeholder="Buscar fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <EmptyState
                title="Nenhum fornecedor cadastrado"
                description="Comece adicionando um novo fornecedor"
                actionLabel="Novo Fornecedor"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{supplier.name}</h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{supplier.city}</span>
                      </div>
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
