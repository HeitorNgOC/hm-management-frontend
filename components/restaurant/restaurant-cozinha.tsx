"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock } from "lucide-react"

interface KitchenItem {
  id: string
  orderNumber: string
  tableNumber: string
  item: string
  quantity: number
  status: "pending" | "preparing" | "ready"
  createdAt: string
}

export default function RestaurantCozinha() {
  const kitchenItems: KitchenItem[] = [
    {
      id: "1",
      orderNumber: "P001",
      tableNumber: "1",
      item: "Peixe à Meunière",
      quantity: 2,
      status: "preparing",
      createdAt: "14:30",
    },
    {
      id: "2",
      orderNumber: "P001",
      tableNumber: "1",
      item: "Salada Caesar",
      quantity: 1,
      status: "ready",
      createdAt: "14:30",
    },
    {
      id: "3",
      orderNumber: "P002",
      tableNumber: "3",
      item: "Risoto de Cogumelos",
      quantity: 3,
      status: "pending",
      createdAt: "14:25",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "ready":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cozinha</h2>
        <p className="text-muted-foreground">Acompanhe os itens em preparação</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {kitchenItems.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{item.item}</CardTitle>
                  <CardDescription>
                    Pedido {item.orderNumber} - Mesa {item.tableNumber}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status === "pending" && "Pendente"}
                  {item.status === "preparing" && "Preparando"}
                  {item.status === "ready" && "Pronto"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm">
                Quantidade: <span className="font-bold">{item.quantity}</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {item.createdAt}
              </div>
              {item.status !== "ready" && (
                <Button className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Pronto
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
