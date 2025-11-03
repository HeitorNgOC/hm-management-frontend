"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Plus, X } from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useFinancial } from "@/hooks/use-financial"

export default function CashRegisterPage() {
  const queryClient = useQueryClient()
  const { getCurrentCashRegister, openCashRegister, closeCashRegister } = useFinancial()
  const [openingBalance, setOpeningBalance] = useState("")
  const [closingBalance, setClosingBalance] = useState("")

  const { data: cashRegister, isLoading } = useQuery({
    queryKey: ["cash-register", "current"],
    queryFn: getCurrentCashRegister,
  })

  const openRegisterMutation = useMutation({
    mutationFn: openCashRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-register"] })
      setOpeningBalance("")
    },
  })

  const closeRegisterMutation = useMutation({
    mutationFn: closeCashRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-register"] })
      setClosingBalance("")
    },
  })

  const handleOpenRegister = async () => {
    await openRegisterMutation.mutateAsync({
      openingBalance: Number.parseFloat(openingBalance),
    })
  }

  const handleCloseRegister = async () => {
    if (cashRegister?.id) {
      await closeRegisterMutation.mutateAsync({
        cashRegisterId: cashRegister.id,
        closingBalance: Number.parseFloat(closingBalance),
      })
    }
  }

  if (isLoading) {
    return <div className="p-4">Carregando...</div>
  }

  const isOpen = cashRegister?.status === "open"

  return (
    <ProtectedRoute permissions={["financial.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Gerencie a abertura e fechamento do caixa</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Status do Caixa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOpen ? (
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-800">Caixa Aberto</p>
                  <p className="text-2xl font-bold text-green-900">R$ {cashRegister?.openingBalance.toFixed(2)}</p>
                  <p className="text-xs text-green-700 mt-1">Saldo Inicial</p>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-800">Caixa Fechado</p>
                  <p className="text-xs text-gray-700">Nenhum caixa aberto no momento</p>
                </div>
              )}

              {!isOpen && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saldo Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded border px-3 py-2"
                  />
                  <Button
                    onClick={handleOpenRegister}
                    className="w-full"
                    disabled={!openingBalance || openRegisterMutation.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Abrir Caixa
                  </Button>
                </div>
              )}

              {isOpen && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saldo Final</label>
                  <input
                    type="number"
                    step="0.01"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded border px-3 py-2"
                  />
                  <Button
                    onClick={handleCloseRegister}
                    variant="destructive"
                    className="w-full"
                    disabled={!closingBalance || closeRegisterMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar Caixa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Informações do caixa atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo Inicial:</span>
                <span className="font-medium">R$ {(cashRegister?.openingBalance || 0).toFixed(2)}</span>
              </div>
              {cashRegister?.closingBalance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo Final:</span>
                  <span className="font-medium">R$ {cashRegister.closingBalance.toFixed(2)}</span>
                </div>
              )}
              {cashRegister?.difference && (
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Diferença:</span>
                  <span className={`font-medium ${cashRegister.difference >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {cashRegister.difference.toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
