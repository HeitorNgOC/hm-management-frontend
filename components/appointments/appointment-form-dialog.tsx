"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateAppointment, useUpdateAppointment, useAppointment, useAvailableSlots } from "@/hooks/use-appointments"
import { createAppointmentSchema, type CreateAppointmentFormData } from "@/lib/validations/appointment"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId?: string
  defaultDate?: string
  onSuccess?: () => void
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointmentId,
  defaultDate,
  onSuccess,
}: AppointmentFormDialogProps) {
  const isEditing = !!appointmentId
  const { data: appointmentData } = useAppointment(appointmentId || "")
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const form = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      clientId: "",
      employeeId: "",
      serviceId: "",
      date: defaultDate || new Date().toISOString().split("T")[0],
      startTime: "",
      notes: "",
    },
  })

  const watchedEmployeeId = form.watch("employeeId")
  const watchedDate = form.watch("date")
  const watchedServiceId = form.watch("serviceId")

  const { data: availableSlots } = useAvailableSlots(watchedEmployeeId, watchedDate, watchedServiceId)

  const slotsPayload = availableSlots as any
  const slots = Array.isArray(slotsPayload) ? slotsPayload : Array.isArray(slotsPayload?.data) ? slotsPayload.data : Array.isArray(slotsPayload?.items) ? slotsPayload.items : []

  useEffect(() => {
    const src = (appointmentData as any)?.data ?? (appointmentData as any)
    if (src) {
      form.reset({
        clientId: src.clientId,
        employeeId: src.employeeId,
        serviceId: src.serviceId,
        date: src.date.split("T")[0],
        startTime: src.startTime,
        notes: src.notes || "",
      })
    }
  }, [appointmentData, form])

  const onSubmit = async (data: CreateAppointmentFormData) => {
    try {
      if (isEditing) {
        await updateAppointment.mutateAsync({ id: appointmentId, data })
      } else {
        await createAppointment.mutateAsync(data)
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">João Silva</SelectItem>
                        <SelectItem value="2">Maria Santos</SelectItem>
                        <SelectItem value="3">Pedro Oliveira</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Carlos Barbeiro</SelectItem>
                        <SelectItem value="2">Ana Cabeleireira</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Corte Masculino - R$ 40,00</SelectItem>
                        <SelectItem value="2">Barba - R$ 30,00</SelectItem>
                        <SelectItem value="3">Corte + Barba - R$ 60,00</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {slots && slots.length > 0 && (
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Disponível</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot: any) => (
                        <Badge
                          key={slot}
                          variant={field.value === slot ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => field.onChange(slot)}
                        >
                          {slot}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adicione observações sobre o agendamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAppointment.isPending || updateAppointment.isPending}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
