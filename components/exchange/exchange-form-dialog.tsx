"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateExchange } from "@/hooks/use-exchange"
import { useInventoryItems } from "@/hooks/use-inventory"
import { createExchangeSchema, type CreateExchangeInput } from "@/lib/validations/exchange"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ExchangeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExchangeFormDialog({ open, onOpenChange }: ExchangeFormDialogProps) {
  const { mutate: createExchange, isPending } = useCreateExchange()
  const { data: inventoryData } = useInventoryItems(1, 1000)
  const [priceDifference, setPriceDifference] = useState(0)

  const form = useForm<CreateExchangeInput>({
    resolver: zodResolver(createExchangeSchema),
    defaultValues: {
      customerName: "",
      customerId: "",
      originalItemId: "",
      originalQuantity: 1,
      newItemId: "",
      newQuantity: 1,
      reason: "",
      notes: "",
    },
  })

  const originalItemId = form.watch("originalItemId")
  const originalQuantity = form.watch("originalQuantity")
  const newItemId = form.watch("newItemId")
  const newQuantity = form.watch("newQuantity")

  useEffect(() => {
    if (originalItemId && newItemId && inventoryData?.data) {
      const originalItem = inventoryData.data.find((item) => item.id === originalItemId)
      const newItem = inventoryData.data.find((item) => item.id === newItemId)

      if (originalItem?.sellPrice && newItem?.sellPrice) {
        const originalTotal = originalItem.sellPrice * originalQuantity
        const newTotal = newItem.sellPrice * newQuantity
        setPriceDifference(newTotal - originalTotal)
      }
    }
  }, [originalItemId, originalQuantity, newItemId, newQuantity, inventoryData])

  const onSubmit = (data: CreateExchangeInput) => {
    createExchange(data, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      },
    })
  }

  const availableItems = inventoryData?.data.filter((item) => item.status === "in_stock" && item.sellPrice)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Troca de Produto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Cliente (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ID ou CPF" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Produto Original</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originalItemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableItems?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {formatCurrency(item.sellPrice || 0)}
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
                  name="originalQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Novo Produto</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newItemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableItems?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {formatCurrency(item.sellPrice || 0)}
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
                  name="newQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {priceDifference !== 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {priceDifference > 0 ? (
                    <span className="text-green-600">Cliente deve pagar: {formatCurrency(priceDifference)}</span>
                  ) : (
                    <span className="text-red-600">
                      Reembolso ao cliente: {formatCurrency(Math.abs(priceDifference))}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Troca</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Tamanho incorreto" />
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
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Observações adicionais" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Registrando..." : "Registrar Troca"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
