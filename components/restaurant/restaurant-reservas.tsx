"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Check, X, Calendar } from "lucide-react"

interface ReservationData {
  id: string
  customerName: string
  date: string
  time: string
  partySize: number
  phone: string
  status: "confirmed" | "pending" | "cancelled"
}

export default function RestaurantReservas() {
  const reservations: ReservationData[] = [
    {
      id: "1",
      customerName: "João Silva",
      date: "21/11/2024",
      time: "19:30",
      partySize: 4,
      phone: "(11) 98765-4321",
      status: "confirmed",
    },
    {
      id: "2",
      customerName: "Maria Santos",
      date: "21/11/2024",
      time: "20:00",
      partySize: 2,
      phone: "(11) 91234-5678",
      status: "pending",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reservas</h2>
          <p className="text-muted-foreground">Gerencie as reservas do restaurante</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      <div className="space-y-3">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{reservation.customerName}</p>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {reservation.date} às {reservation.time}
                    </div>
                    <div>{reservation.partySize} pessoas</div>
                    <div>{reservation.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(reservation.status)}>
                    {reservation.status === "confirmed" && "Confirmada"}
                    {reservation.status === "pending" && "Pendente"}
                    {reservation.status === "cancelled" && "Cancelada"}
                  </Badge>
                  {reservation.status === "pending" && (
                    <>
                      <Button size="sm" variant="default">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
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
