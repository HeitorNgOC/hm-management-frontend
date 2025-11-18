"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateGymClass, useUpdateGymClass, useGymClass, useModalities } from "@/hooks/use-gym"
import { useUsers } from "@/hooks/use-users"
import { createGymClassSchema, type CreateGymClassFormData } from "@/lib/validations/gym"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface GymClassFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId?: string
  onSuccess?: () => void
}

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
]

export function GymClassFormDialog({ open, onOpenChange, classId, onSuccess }: GymClassFormDialogProps) {
  const isEditing = !!classId
  const { data: classData } = useGymClass(classId || "")
  const { data: modalitiesData } = useModalities({}, 1, 100)
  const { data: usersData } = useUsers({}, 1, 100)
  const modalitiesPayload = modalitiesData as any
  const modalities = Array.isArray(modalitiesPayload) ? modalitiesPayload : modalitiesPayload?.data ?? modalitiesPayload?.items ?? []
  const usersPayload = usersData as any
  const users = Array.isArray(usersPayload) ? usersPayload : usersPayload?.data ?? usersPayload?.items ?? []
  const createGymClass = useCreateGymClass()
  const updateGymClass = useUpdateGymClass()

  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([])

  const form = useForm<CreateGymClassFormData>({
    resolver: zodResolver(createGymClassSchema),
    defaultValues: {
      modalityId: "",
      name: "",
      description: "",
      instructorIds: [],
      schedule: [{ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" }],
      maxStudents: 20,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  })

  useEffect(() => {
    if (classData) {
      form.reset({
        modalityId: classData.modalityId,
        name: classData.name,
        description: classData.description || "",
        instructorIds: classData.instructorIds,
        schedule: classData.schedule,
        maxStudents: classData.maxStudents,
        startDate: classData.startDate.split("T")[0],
        endDate: classData.endDate ? classData.endDate.split("T")[0] : "",
      })
      setSelectedInstructors(classData.instructorIds)
    }
  }, [classData, form])

  const handleInstructorToggle = (instructorId: string) => {
    const newSelected = selectedInstructors.includes(instructorId)
      ? selectedInstructors.filter((id) => id !== instructorId)
      : [...selectedInstructors, instructorId]

    setSelectedInstructors(newSelected)
    form.setValue("instructorIds", newSelected)
  }

  const onSubmit = async (data: CreateGymClassFormData) => {
    try {
      if (isEditing) {
        await updateGymClass.mutateAsync({ id: classId, data })
      } else {
        await createGymClass.mutateAsync(data)
      }
      form.reset()
      setSelectedInstructors([])
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Turma</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Muay Thai Iniciante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modalityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma modalidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modalities.map((modality: any) => (
                          <SelectItem key={modality.id} value={modality.id}>
                            {modality.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Alunos</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva a turma..." className="resize-none" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Instrutores</FormLabel>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {users.filter((user: any) => user.role === "EMPLOYEE" || user.role === "MANAGER").map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`instructor-${user.id}`}
                        checked={selectedInstructors.includes(user.id)}
                        onCheckedChange={() => handleInstructorToggle(user.id)}
                      />
                      <label
                        htmlFor={`instructor-${user.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {user.name}
                      </label>
                    </div>
                  ))}
              </div>
              {form.formState.errors.instructorIds && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.instructorIds.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Horários</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Horário
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`schedule.${index}.dayOfWeek`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {daysOfWeek.map((day) => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createGymClass.isPending || updateGymClass.isPending}>
                {(createGymClass.isPending || updateGymClass.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
