"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateEnrollment, useUpdateEnrollment, useEnrollment, useGymClasses } from "@/hooks/use-gym"
import { createEnrollmentSchema, type CreateEnrollmentFormData } from "@/lib/validations/gym"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EnrollmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollmentId?: string
  onSuccess?: () => void
}

export function EnrollmentFormDialog({ open, onOpenChange, enrollmentId, onSuccess }: EnrollmentFormDialogProps) {
  const isEditing = !!enrollmentId
  const { data: enrollmentData } = useEnrollment(enrollmentId || "")
  const { data: classesData } = useGymClasses({ status: "active" }, 1, 100)
  const createEnrollment = useCreateEnrollment()
  const updateEnrollment = useUpdateEnrollment()

  const form = useForm<CreateEnrollmentFormData>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: {
      classId: "",
      clientId: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (enrollmentData?.data) {
      form.reset({
        classId: enrollmentData.data.classId,
        clientId: enrollmentData.data.clientId,
        notes: enrollmentData.data.notes || "",
      })
    }
  }, [enrollmentData, form])

  const onSubmit = async (data: CreateEnrollmentFormData) => {
    try {
      if (isEditing) {
        await updateEnrollment.mutateAsync({ id: enrollmentId, data: { notes: data.notes } })
      } else {
        await createEnrollment.mutateAsync(data)
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Inscrição" : "Nova Inscrição"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classesData?.data.map((gymClass) => (
                        <SelectItem key={gymClass.id} value={gymClass.id} disabled={gymClass.status === "full"}>
                          <div className="flex items-center justify-between w-full">
                            <span>{gymClass.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({gymClass.currentStudents}/{gymClass.maxStudents})
                            </span>
                          </div>
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
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="client-1">João Silva</SelectItem>
                      <SelectItem value="client-2">Maria Santos</SelectItem>
                      <SelectItem value="client-3">Pedro Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre a inscrição..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createEnrollment.isPending || updateEnrollment.isPending}>
                {(createEnrollment.isPending || updateEnrollment.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Salvar" : "Inscrever"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
