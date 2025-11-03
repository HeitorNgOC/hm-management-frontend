"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreatePosition, useUpdatePosition, usePosition } from "@/hooks/use-positions"
import { createPositionSchema, type CreatePositionFormData } from "@/lib/validations/position"
import { AVAILABLE_PERMISSIONS } from "@/lib/types/position"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PositionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  positionId?: string
  onSuccess?: () => void
}

export function PositionFormDialog({ open, onOpenChange, positionId, onSuccess }: PositionFormDialogProps) {
  const isEditing = !!positionId
  const { data: positionData } = usePosition(positionId || "")
  const createPosition = useCreatePosition()
  const updatePosition = useUpdatePosition()

  const form = useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  })

  useEffect(() => {
    if (positionData?.data) {
      form.reset({
        name: positionData.data.name,
        description: positionData.data.description || "",
        permissions: positionData.data.permissions,
      })
    }
  }, [positionData, form])

  const onSubmit = async (data: CreatePositionFormData) => {
    try {
      if (isEditing) {
        await updatePosition.mutateAsync({ id: positionId, data })
      } else {
        await createPosition.mutateAsync(data)
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    },
    {} as Record<string, typeof AVAILABLE_PERMISSIONS>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cargo" : "Novo Cargo"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Barbeiro, Recepcionista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva as responsabilidades deste cargo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem className="flex-1 overflow-hidden flex flex-col">
                  <div>
                    <FormLabel>Permissões</FormLabel>
                    <FormDescription>Selecione as permissões que este cargo terá no sistema</FormDescription>
                  </div>
                  <ScrollArea className="flex-1 border rounded-md p-4">
                    <div className="space-y-6">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-sm">{category}</h4>
                          <div className="space-y-2">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.key}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.key)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || []
                                          const updated = checked
                                            ? [...current, permission.key]
                                            : current.filter((p) => p !== permission.key)
                                          field.onChange(updated)
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="font-normal cursor-pointer">{permission.label}</FormLabel>
                                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPosition.isPending || updatePosition.isPending}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
