"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Eye, CheckCircle } from "lucide-react"

interface OrderData {
  id: string
  orderNumber: string
  tableNumber: string
  items: string[]
  total: number
  status: "pending" | "preparing" | "ready" | "delivered"
  createdAt: string
}

export default function RestaurantPedidos() {
  const orders: OrderData[] = [
    {
      id: "1",
      orderNumber: "P001",
      tableNumber: "1",
      items: ["2x Peixe à Meunière", "1x Salada Caesar"],
      total: 85.9,
      status: "preparing",
      createdAt: "14:30",
    },
    {
      id: "2",
      orderNumber: "P002",
      tableNumber: "3",
      items: ["3x Risoto de Cogumelos", "1x Vinho Tinto"],
      total: 125.5,
      status: "ready",
      createdAt: "14:25",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-muted-foreground">Acompanhe os pedidos em tempo real</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Pedido {order.orderNumber} - Mesa {order.tableNumber}
                  </CardTitle>
                  <CardDescription>{order.createdAt}</CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Itens:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {order.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <p className="font-bold">Total: R$ {order.total.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  {order.status === "ready" && (
                    <Button size="sm" variant="default">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Entregar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
