"use client"

import { useState } from "react"
import { useTables, useUpdateTable } from "@/hooks/use-restaurant"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { TableFormDialog } from "./table-form-dialog"
import { OrderDialog } from "./order-dialog"
import type { Table, TableStatus } from "@/lib/types/restaurant"

export function TableGrid() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const { data, isLoading } = useTables()
  const updateTable = useUpdateTable()

  const getStatusColor = (status: TableStatus) => {
    const colors = {
      available: "bg-green-500",
      occupied: "bg-red-500",
      reserved: "bg-yellow-500",
      cleaning: "bg-blue-500",
    }
    return colors[status]
  }

  const getStatusLabel = (status: TableStatus) => {
    const labels = {
      available: "Disponível",
      occupied: "Ocupada",
      reserved: "Reservada",
      cleaning: "Limpeza",
    }
    return labels[status]
  }

  const handleTableClick = (table: Table) => {
    if (table.status === "available") {
      setSelectedTable(table)
    }
  }

  const payload = data as any
  const tables = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mesas</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Mesa
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tables.map((table: any) => (
            <Card
              key={table.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                table.status === "available" ? "hover:border-primary" : ""
              }`}
              onClick={() => handleTableClick(table)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Mesa {table.number}</span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{table.capacity} pessoas</span>
                </div>
                <Badge
                  variant={table.status === "available" ? "default" : "secondary"}
                  className="w-full justify-center"
                >
                  {getStatusLabel(table.status)}
                </Badge>
                {table.location && <p className="text-xs text-muted-foreground">{table.location}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <TableFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      {selectedTable && (
        <OrderDialog
          open={!!selectedTable}
          onOpenChange={(open) => !open && setSelectedTable(null)}
          table={selectedTable}
          onSuccess={() => setSelectedTable(null)}
        />
      )}
    </div>
  )
}
