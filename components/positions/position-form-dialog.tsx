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
// Use native overflow for permissions area to avoid Radix ScrollArea click/overlay issues

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
    // `positionData` comes from the service and is the Position object (api-client unwraps envelopes).
    // Normalize to support both shapes: either the position itself or an envelope with `.data`.
    const payload = (positionData as any)?.data ?? (positionData as any)
    if (payload) {
      form.reset({
        name: payload.name,
        description: payload.description || "",
        permissions: payload.permissions || [],
      })
    }
  }, [positionData, form])

  const onSubmit = async (data: CreatePositionFormData) => {
    try {
      // Normalize permissions to ensure they are valid Permission values.
      const normalizedPermissions = (data.permissions || []).filter((p): p is any =>
        allPermissionKeys.includes(p as any),
      )

      if (isEditing) {
        await updatePosition.mutateAsync({ id: positionId!, data: { ...data, permissions: normalizedPermissions } })
      } else {
        await createPosition.mutateAsync({ ...data, permissions: normalizedPermissions })
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

  const allPermissionKeys = AVAILABLE_PERMISSIONS.map((p) => p.key)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
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
                    {/* Select-all checkbox is shown inside the permissions box above */}
                  </div>
                  <div className="flex-1 border rounded-md p-4 overflow-auto">
                    {/* Select all checkbox inside the permissions box */}
                    <div className="mb-3 flex items-center gap-3">
                      {/**
                       * Use form.watch so the checkbox reflects current selection.
                       * checked accepts boolean or 'indeterminate' (Radix).
                       */}
                      {
                        (() => {
                          const selected: string[] = form.watch("permissions") || []
                          const allSelected = allPermissionKeys.length > 0 && selected.length === allPermissionKeys.length
                          const someSelected = selected.length > 0 && selected.length < allPermissionKeys.length

                          return (
                            <>
                              <Checkbox
                                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                onCheckedChange={(val) => {
                                  if (val) {
                                    form.setValue("permissions", allPermissionKeys)
                                  } else {
                                    form.setValue("permissions", [])
                                  }
                                }}
                              />
                              <span className="text-sm font-medium">Selecionar todos</span>
                            </>
                          )
                        })()
                      }
                    </div>
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
                  </div>
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
