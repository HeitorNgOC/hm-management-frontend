"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createServiceSchema, type CreateServiceFormData } from "@/lib/validations/service"
import { useCreateService, useUpdateService, useService } from "@/hooks/use-services"

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId?: string
  onSuccess?: () => void
}

export function ServiceFormDialog({ open, onOpenChange, serviceId, onSuccess }: ServiceFormDialogProps) {
  const isEditing = !!serviceId
  const { data: serviceData } = useService(serviceId)
  const createService = useCreateService()
  const updateService = useUpdateService()

  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { name: "", description: "", duration: 30, price: 0, categoryId: "" },
  })

  useEffect(() => {
    if (serviceData) {
      form.reset({
        name: (serviceData as any).name,
        description: (serviceData as any).description,
        duration: (serviceData as any).duration,
        price: (serviceData as any).price,
        categoryId: (serviceData as any).categoryId || "",
      })
    }
  }, [serviceData, form])

  const onSubmit = async (data: CreateServiceFormData) => {
    try {
      if (isEditing && serviceId) {
        await updateService.mutateAsync({ id: serviceId, data })
      } else {
        await createService.mutateAsync(data)
      }
      form.reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      // handled by hooks
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (min)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
              <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
