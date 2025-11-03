"use client"

import { useState } from "react"
import type { PaymentMethod } from "@/lib/types/company"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Banknote, Smartphone, Building2, Wallet } from "lucide-react"

const availablePaymentMethods = [
  {
    type: "cash" as const,
    name: "Dinheiro",
    icon: Banknote,
    description: "Pagamento em espécie",
  },
  {
    type: "credit_card" as const,
    name: "Cartão de Crédito",
    icon: CreditCard,
    description: "Aceita cartões de crédito",
  },
  {
    type: "debit_card" as const,
    name: "Cartão de Débito",
    icon: Wallet,
    description: "Aceita cartões de débito",
  },
  {
    type: "pix" as const,
    name: "PIX",
    icon: Smartphone,
    description: "Pagamento instantâneo via PIX",
  },
  {
    type: "bank_transfer" as const,
    name: "Transferência Bancária",
    icon: Building2,
    description: "Transferência entre contas",
  },
]

interface PaymentMethodsFormProps {
  onSubmit: (data: PaymentMethod[]) => void
  onBack: () => void
  defaultValues?: PaymentMethod[]
  isLoading?: boolean
}

export function PaymentMethodsForm({ onSubmit, onBack, defaultValues, isLoading }: PaymentMethodsFormProps) {
  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(
    new Set(defaultValues?.map((m) => m.type) || ["cash", "pix"]),
  )

  const handleToggleMethod = (type: string) => {
    const newSelected = new Set(selectedMethods)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedMethods(newSelected)
  }

  const handleFormSubmit = () => {
    if (selectedMethods.size === 0) {
      return
    }

    const methods: PaymentMethod[] = Array.from(selectedMethods).map((type, index) => {
      const method = availablePaymentMethods.find((m) => m.type === type)!
      return {
        id: Date.now().toString() + index,
        type: type as PaymentMethod["type"],
        name: method.name,
        isActive: true,
        order: index,
      }
    })

    onSubmit(methods)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Selecione os métodos de pagamento aceitos pela sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {availablePaymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethods.has(method.type)

              return (
                <div
                  key={method.type}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <Checkbox
                    id={method.type}
                    checked={isSelected}
                    onCheckedChange={() => handleToggleMethod(method.type)}
                  />
                  <div className="flex flex-1 items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={method.type} className="cursor-pointer font-medium">
                        {method.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedMethods.size === 0 && (
            <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">Selecione pelo menos um método de pagamento</p>
            </div>
          )}

          {selectedMethods.size > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">
                {selectedMethods.size} {selectedMethods.size === 1 ? "método selecionado" : "métodos selecionados"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleFormSubmit} disabled={isLoading || selectedMethods.size === 0}>
          {isLoading ? "Salvando..." : "Concluir"}
        </Button>
      </div>
    </div>
  )
}
