"use client"

import { useState } from "react"
import { useAppointments } from "@/hooks/use-appointments"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { AppointmentFormDialog } from "./appointment-form-dialog"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { format, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const dateString = format(selectedDate, "yyyy-MM-dd")
  const { data, isLoading } = useAppointments({ date: dateString })

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8
    return `${hour.toString().padStart(2, "0")}:00`
  })

  const getAppointmentsForSlot = (time: string) => {
    const payload = data as any
    const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.items ?? []
    return rows.filter((apt: any) => apt.startTime === time) || []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Agenda</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-lg font-medium">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
          />
        </Card>

        <Card className="p-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((time) => {
                const appointments = getAppointmentsForSlot(time)
                return (
                  <div key={time} className="flex gap-4 border-b pb-2 last:border-0">
                    <div className="w-16 text-sm text-muted-foreground font-medium">{time}</div>
                    <div className="flex-1 space-y-2">
                      {appointments.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic">Disponível</div>
                      ) : (
                        appointments.map((apt: any) => (
                          <div key={apt.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{apt.client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {apt.service.name} • {apt.employee.name}
                              </div>
                            </div>
                            <AppointmentStatusBadge status={apt.status} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <AppointmentFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultDate={dateString}
        onSuccess={() => setIsCreateOpen(false)}
      />
    </div>
  )
}
