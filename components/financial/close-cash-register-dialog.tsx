"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCloseCashRegister } from "@/hooks/use-financial"
import { closeCashRegisterSchema, type CloseCashRegisterFormData } from "@/lib/validations/financial"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { CashRegister } from "@/lib/types/financial"

interface CloseCashRegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cashRegister: CashRegister
  onSuccess?: () => void
}

export function CloseCashRegisterDialog({ open, onOpenChange, cashRegister, onSuccess }: CloseCashRegisterDialogProps) {
  const closeCashRegister = useCloseCashRegister()

  const form = useForm<CloseCashRegisterFormData>({
    resolver: zodResolver(closeCashRegisterSchema),
    defaultValues: {
      closingBalance: 0,
      notes: "",
    },
  })

  const watchedClosingBalance = form.watch("closingBalance")
  const expectedBalance = cashRegister.openingBalance
  const difference = watchedClosingBalance - expectedBalance

  const onSubmit = async (data: CloseCashRegisterFormData) => {
    try {
      await closeCashRegister.mutateAsync({ id: cashRegister.id, data })
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saldo Inicial:</span>
            <span className="font-medium">R$ {cashRegister.openingBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saldo Esperado:</span>
            <span className="font-medium">R$ {expectedBalance.toFixed(2)}</span>
          </div>
          {watchedClosingBalance > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Diferença:</span>
              <span className={`font-medium ${difference !== 0 ? "text-destructive" : "text-green-600"}`}>
                R$ {difference.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="closingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Final (Contado)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adicione observações sobre o fechamento do caixa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={closeCashRegister.isPending}>
                Fechar Caixa
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
