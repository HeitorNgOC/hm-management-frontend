"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Clock } from "lucide-react"

interface TableData {
  id: string
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved" | "cleaning"
  currentCustomers?: string
  orderTime?: string
}

export default function RestaurantMesas() {
  const tables: TableData[] = [
    { id: "1", number: "1", capacity: 4, status: "occupied", currentCustomers: "João Silva", orderTime: "30 min" },
    { id: "2", number: "2", capacity: 2, status: "available" },
    { id: "3", number: "3", capacity: 6, status: "occupied", currentCustomers: "Maria Santos", orderTime: "15 min" },
    { id: "4", number: "4", capacity: 4, status: "reserved" },
    { id: "5", number: "5", capacity: 2, status: "cleaning" },
    { id: "6", number: "6", capacity: 4, status: "available" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-orange-100 text-orange-800"
      case "reserved":
        return "bg-blue-100 text-blue-800"
      case "cleaning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: "Disponível",
      occupied: "Ocupada",
      reserved: "Reservada",
      cleaning: "Limpando",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mesas</h2>
          <p className="text-muted-foreground">Gerencie as mesas do restaurante</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Mesa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              table.status === "available" ? "" : "border-2"
            }`}
          >
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="text-3xl font-bold">Mesa {table.number}</div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {table.capacity} lugares
                </div>
                <Badge className={getStatusColor(table.status)}>{getStatusLabel(table.status)}</Badge>
                {table.currentCustomers && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">{table.currentCustomers}</p>
                    {table.orderTime && (
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {table.orderTime}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
