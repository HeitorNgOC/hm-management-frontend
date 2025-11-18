"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateModality, useUpdateModality, useModality } from "@/hooks/use-gym"
import { createModalitySchema, type CreateModalityFormData } from "@/lib/validations/gym"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ModalityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modalityId?: string
  onSuccess?: () => void
}

export function ModalityFormDialog({ open, onOpenChange, modalityId, onSuccess }: ModalityFormDialogProps) {
  const isEditing = !!modalityId
  const { data: modalityData } = useModality(modalityId || "")
  const createModality = useCreateModality()
  const updateModality = useUpdateModality()

  const form = useForm<CreateModalityFormData>({
    resolver: zodResolver(createModalitySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      icon: "",
      maxStudentsPerClass: 20,
      durationMinutes: 60,
    },
  })

  useEffect(() => {
    const src = (modalityData as any)?.data ?? (modalityData as any)
    if (src) {
      form.reset({
        name: src.name,
        description: src.description || "",
        color: src.color || "#3b82f6",
        icon: src.icon || "",
        maxStudentsPerClass: src.maxStudentsPerClass,
        durationMinutes: src.durationMinutes,
      })
    }
  }, [modalityData, form])

  const onSubmit = async (data: CreateModalityFormData) => {
    try {
      if (isEditing) {
        await updateModality.mutateAsync({ id: modalityId, data })
      } else {
        await createModality.mutateAsync(data)
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
          <DialogTitle>{isEditing ? "Editar Modalidade" : "Nova Modalidade"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Muay Thai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-20 h-10" />
                        <Input {...field} placeholder="#3b82f6" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStudentsPerClass"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva a modalidade..." className="resize-none" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createModality.isPending || updateModality.isPending}>
                {(createModality.isPending || updateModality.isPending) && (
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
