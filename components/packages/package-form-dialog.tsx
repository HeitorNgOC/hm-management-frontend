"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createPackageSchema, type CreatePackageFormData } from "@/lib/validations/package"
import { useCreatePackage, useUpdatePackage, usePackage } from "@/hooks/use-packages"

interface PackageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId?: string
  onSuccess?: () => void
}

export function PackageFormDialog({ open, onOpenChange, packageId, onSuccess }: PackageFormDialogProps) {
  const isEditing = !!packageId
  const { data: packageData } = usePackage(packageId)
  const createPkg = useCreatePackage()
  const updatePkg = useUpdatePackage()

  const form = useForm<CreatePackageFormData>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: { name: "", description: "", price: 0, items: [{ quantity: 1 }], discountPercentage: undefined },
  })

  useEffect(() => {
    if (packageData) {
      form.reset({
        name: (packageData as any).name,
        description: (packageData as any).description,
        price: (packageData as any).price,
        items: (packageData as any).items?.map((it: any) => ({ serviceId: it.serviceId, productId: it.productId, quantity: it.quantity })) || [{ quantity: 1 }],
        discountPercentage: (packageData as any).discountPercentage,
      })
    }
  }, [packageData, form])

  const onSubmit = async (data: CreatePackageFormData) => {
    try {
      if (isEditing && packageId) {
        await updatePkg.mutateAsync({ id: packageId, data } as any)
      } else {
        await createPkg.mutateAsync(data as any)
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Pacote" : "Novo Pacote"}</DialogTitle>
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
              <Button type="submit" disabled={createPkg.isPending || updatePkg.isPending}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
