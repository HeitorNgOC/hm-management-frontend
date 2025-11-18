"use client"

import { useState } from "react"
import { useCurrentCashRegister } from "@/hooks/use-financial"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"
import { OpenCashRegisterDialog } from "./open-cash-register-dialog"
import { CloseCashRegisterDialog } from "./close-cash-register-dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CashRegisterCard() {
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const { data, isLoading } = useCurrentCashRegister()

  const cashRegister = data

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando...</div>
      </Card>
    )
  }

  if (!cashRegister) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Caixa Fechado</h3>
            <p className="text-sm text-muted-foreground">Abra o caixa para começar a registrar transações</p>
          </div>
          <Button onClick={() => setIsOpenDialogOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Abrir Caixa
          </Button>
        </div>

        <OpenCashRegisterDialog
          open={isOpenDialogOpen}
          onOpenChange={setIsOpenDialogOpen}
          onSuccess={() => setIsOpenDialogOpen(false)}
        />
      </Card>
    )
  }

  const currentBalance = cashRegister.openingBalance

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Caixa Aberto</h3>
            <p className="text-sm text-muted-foreground">
              Aberto em {format(new Date(cashRegister.openedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <Badge variant="default">Aberto</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Saldo Inicial</p>
            <p className="text-2xl font-bold">R$ {cashRegister.openingBalance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo Atual</p>
            <p className="text-2xl font-bold">R$ {currentBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Operador:</p>
          <p className="text-sm font-medium">{cashRegister.user.name}</p>
        </div>

        <Button variant="destructive" className="w-full" onClick={() => setIsCloseDialogOpen(true)}>
          Fechar Caixa
        </Button>
      </div>

      <CloseCashRegisterDialog
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        cashRegister={cashRegister}
        onSuccess={() => setIsCloseDialogOpen(false)}
      />
    </Card>
  )
}
