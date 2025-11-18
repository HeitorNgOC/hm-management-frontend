"use client"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { operatingHoursSchema } from "@/lib/validations/company"
import type { OperatingHours } from "@/lib/types/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

const operatingHoursArraySchema = z.object({
  hours: z.array(operatingHoursSchema),
})

type OperatingHoursFormData = z.infer<typeof operatingHoursArraySchema>

interface OperatingHoursFormProps {
  onSubmit: (data: OperatingHours[]) => void
  onBack: () => void
  defaultValues?: OperatingHours[]
  isLoading?: boolean
}

export function OperatingHoursForm({ onSubmit, onBack, defaultValues, isLoading }: OperatingHoursFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OperatingHoursFormData>({
    resolver: zodResolver(operatingHoursArraySchema),
    defaultValues: {
      hours:
        defaultValues ||
        daysOfWeek.map((day) => ({
          dayOfWeek: day.value as OperatingHours["dayOfWeek"],
          isOpen: day.value >= 1 && day.value <= 5, // Segunda a Sexta aberto por padrão
          openTime: "09:00",
          closeTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
        })),
    },
  })

  const { fields } = useFieldArray({
    control,
    name: "hours",
  })

  const handleFormSubmit = (data: OperatingHoursFormData) => {
    // cast to the expected OperatingHours[] shape (zod inference can be slightly different from TS union literal types)
    onSubmit(data.hours as unknown as OperatingHours[])
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horários de Funcionamento</CardTitle>
          <CardDescription>Configure os horários de funcionamento da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const isOpen = watch(`hours.${index}.isOpen`)
            const dayLabel = daysOfWeek.find((d) => d.value === field.dayOfWeek)?.label

            return (
              <div key={field.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`hours.${index}.isOpen`} className="text-base font-semibold">
                    {dayLabel}
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isOpen ? "Aberto" : "Fechado"}</span>
                    <Switch {...register(`hours.${index}.isOpen`)} id={`hours.${index}.isOpen`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="space-y-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`hours.${index}.openTime`}>Abertura</Label>
                        <Input id={`hours.${index}.openTime`} type="time" {...register(`hours.${index}.openTime`)} />
                        {errors.hours?.[index]?.openTime && (
                          <p className="text-sm text-destructive">{errors.hours[index]?.openTime?.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`hours.${index}.closeTime`}>Fechamento</Label>
                        <Input id={`hours.${index}.closeTime`} type="time" {...register(`hours.${index}.closeTime`)} />
                        {errors.hours?.[index]?.closeTime && (
                          <p className="text-sm text-destructive">{errors.hours[index]?.closeTime?.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`hours.${index}.breakStart`}>Início do Intervalo (opcional)</Label>
                        <Input
                          id={`hours.${index}.breakStart`}
                          type="time"
                          {...register(`hours.${index}.breakStart`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`hours.${index}.breakEnd`}>Fim do Intervalo (opcional)</Label>
                        <Input id={`hours.${index}.breakEnd`} type="time" {...register(`hours.${index}.breakEnd`)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Próximo"}
        </Button>
      </div>
    </form>
  )
}
