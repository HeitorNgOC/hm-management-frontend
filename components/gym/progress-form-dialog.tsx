"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateProgress } from "@/hooks/use-workout"
import { createProgressSchema, type CreateProgressFormData } from "@/lib/validations/workout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ProgressFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ProgressFormDialog({ open, onOpenChange, onSuccess }: ProgressFormDialogProps) {
  const createProgress = useCreateProgress()

  const form = useForm<CreateProgressFormData>({
    resolver: zodResolver(createProgressSchema),
    defaultValues: {
      clientId: "",
      date: new Date().toISOString().split("T")[0],
      weight: undefined,
      bodyFat: undefined,
      muscleMass: undefined,
      measurements: {
        chest: undefined,
        waist: undefined,
        hips: undefined,
        biceps: undefined,
        thighs: undefined,
        calves: undefined,
      },
      notes: "",
    },
  })

  const onSubmit = async (data: CreateProgressFormData) => {
    try {
      await createProgress.mutateAsync(data)
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Evolução</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectItem value="client-1">João Silva</SelectItem>
                        <SelectItem value="client-2">Maria Santos</SelectItem>
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

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="70.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyFat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gordura Corporal (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="15.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="muscleMass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Massa Muscular (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="55.0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Medidas Corporais (cm)</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="measurements.chest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peitoral</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cintura</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.hips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quadril</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.biceps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bíceps</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.thighs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coxas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.calves"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panturrilhas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre a evolução..."
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
              <Button type="submit" disabled={createProgress.isPending}>
                {createProgress.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
