"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Download, Eye, FileText } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/crud"
import { Badge } from "@/components/ui/badge"

export default function InvoicesPage() {
  const [search, setSearch] = useState("")

  const invoices = [
    {
      id: 1,
      invoiceNumber: "NF-001",
      supplier: "Fornecedor ABC",
      amount: 5200.0,
      dueDate: "2024-12-15",
      status: "pending" as const,
      issueDate: "2024-11-15",
    },
    {
      id: 2,
      invoiceNumber: "NF-002",
      supplier: "Distribuição XYZ",
      amount: 3400.0,
      dueDate: "2024-11-20",
      status: "paid" as const,
      issueDate: "2024-11-01",
    },
  ]

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier.toLowerCase().includes(search.toLowerCase()),
  )

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  }

  return (
    <ProtectedRoute requiredPermissions={["inventory.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas Fiscais de Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie as notas fiscais de compra</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova NF
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ 5.200,00</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">1</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Este Mês</CardTitle>
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
                <CardTitle>Notas Fiscais</CardTitle>
                <CardDescription>Total: {filteredInvoices.length} notas</CardDescription>
              </div>
              <Input
                placeholder="Buscar NF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredInvoices.length === 0 ? (
              <EmptyState
                title="Nenhuma nota fiscal"
                description="Nenhuma NF para este período"
                actionLabel="Nova NF"
              />
            ) : (
              <div className="space-y-2">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {invoice.invoiceNumber} - {invoice.supplier}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status === "pending" && "Pendente"}
                        {invoice.status === "paid" && "Paga"}
                        {(invoice.status as string) === "overdue" && "Vencida"}
                      </Badge>
                      <p className="font-bold">R$ {invoice.amount.toFixed(2)}</p>
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
