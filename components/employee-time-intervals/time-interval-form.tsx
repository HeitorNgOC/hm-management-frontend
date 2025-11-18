"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"
import type { Resolver } from "react-hook-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { EmployeeTimeInterval } from "@/lib/types/employee-time-interval"

const DAYS = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Segunda-feira" },
  { id: 2, name: "Terça-feira" },
  { id: 3, name: "Quarta-feira" },
  { id: 4, name: "Quinta-feira" },
  { id: 5, name: "Sexta-feira" },
  { id: 6, name: "Sábado" },
]

const timeIntervalSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  breakEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  isWorkDay: z.boolean().default(true),
})

type TimeIntervalFormData = z.infer<typeof timeIntervalSchema>

interface TimeIntervalFormProps {
  employeeId: string
  defaultValues?: Partial<EmployeeTimeInterval>
  onSubmit: (data: TimeIntervalFormData) => Promise<void>
  isLoading?: boolean
}

export function TimeIntervalForm({ employeeId, defaultValues, onSubmit, isLoading = false }: TimeIntervalFormProps) {
  const [hasBreak, setHasBreak] = useState(!!defaultValues?.breakStartTime)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TimeIntervalFormData>({
    resolver: zodResolver(timeIntervalSchema) as unknown as Resolver<TimeIntervalFormData>,
    defaultValues: {
      dayOfWeek: defaultValues?.dayOfWeek ?? 1,
      startTime: defaultValues?.startTime ?? "09:00",
      endTime: defaultValues?.endTime ?? "18:00",
      breakStartTime: defaultValues?.breakStartTime ?? "12:00",
      breakEndTime: defaultValues?.breakEndTime ?? "13:00",
      isWorkDay: defaultValues?.isWorkDay ?? true,
    },
  })

  const isWorkDay = watch("isWorkDay")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horário de Trabalho</CardTitle>
          <CardDescription>Configure o horário de trabalho para este funcionário</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dayOfWeek">Dia da Semana</Label>
            <select {...register("dayOfWeek")} id="dayOfWeek" className="w-full rounded border px-3 py-2">
              {DAYS.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.name}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && <p className="text-sm text-destructive">{errors.dayOfWeek.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="isWorkDay" {...register("isWorkDay")} />
            <Label htmlFor="isWorkDay" className="cursor-pointer">
              Dia de trabalho
            </Label>
          </div>

          {isWorkDay && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Hora de Início</Label>
                  <Input id="startTime" type="time" {...register("startTime")} disabled={isLoading} />
                  {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
                </div>

                <div>
                  <Label htmlFor="endTime">Hora de Término</Label>
                  <Input id="endTime" type="time" {...register("endTime")} disabled={isLoading} />
                  {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="hasBreak" checked={hasBreak} onCheckedChange={(val) => setHasBreak(Boolean(val))} />
                <Label htmlFor="hasBreak" className="cursor-pointer">
                  Adicionar intervalo
                </Label>
              </div>

              {hasBreak && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="breakStartTime">Início do Intervalo</Label>
                    <Input id="breakStartTime" type="time" {...register("breakStartTime")} disabled={isLoading} />
                    {errors.breakStartTime && (
                      <p className="text-sm text-destructive">{errors.breakStartTime.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="breakEndTime">Fim do Intervalo</Label>
                    <Input id="breakEndTime" type="time" {...register("breakEndTime")} disabled={isLoading} />
                    {errors.breakEndTime && <p className="text-sm text-destructive">{errors.breakEndTime.message}</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : "Salvar Horário"}
      </Button>
    </form>
  )
}
