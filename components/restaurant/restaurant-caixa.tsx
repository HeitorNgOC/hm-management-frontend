"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, DollarSign } from "lucide-react"

interface OrderPayment {
  id: string
  orderNumber: string
  tableNumber: string
  amount: number
  paymentMethod: "cash" | "card" | "pix"
  status: "pending" | "paid"
}

export default function RestaurantCaixa() {
  const payments: OrderPayment[] = [
    {
      id: "1",
      orderNumber: "P001",
      tableNumber: "1",
      amount: 85.9,
      paymentMethod: "card",
      status: "pending",
    },
    {
      id: "2",
      orderNumber: "P003",
      tableNumber: "4",
      amount: 52.5,
      paymentMethod: "pix",
      status: "paid",
    },
  ]

  const totalPending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Caixa</h2>
        <p className="text-muted-foreground">Gerencie os pagamentos e fechamento de caixa</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">R$ {totalPending.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">R$ {totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {(totalPending + totalPaid).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Pendentes</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {payments
              .filter((p) => p.status === "pending")
              .map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <p className="font-medium">
                      Pedido {payment.orderNumber} - Mesa {payment.tableNumber}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      {payment.paymentMethod === "cash" && "Dinheiro"}
                      {payment.paymentMethod === "card" && "Cartão"}
                      {payment.paymentMethod === "pix" && "Pix"}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ {payment.amount.toFixed(2)}</p>
                    <Button size="sm" className="mt-2">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Receber
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
