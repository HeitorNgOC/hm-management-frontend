"use client"

import { useCurrentSubscription, useCancelSubscription } from "@/hooks/use-subscription"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CurrentSubscription() {
  const { data, isLoading } = useCurrentSubscription()
  const cancelSubscription = useCancelSubscription()

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (!data?.data) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Você não possui uma assinatura ativa</p>
      </Card>
    )
  }

  const subscription = data.data

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: "Ativa", variant: "default" as const },
      past_due: { label: "Vencida", variant: "destructive" as const },
      cancelled: { label: "Cancelada", variant: "secondary" as const },
      expired: { label: "Expirada", variant: "secondary" as const },
      trial: { label: "Teste", variant: "outline" as const },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleCancel = async () => {
    if (confirm("Tem certeza que deseja cancelar sua assinatura?")) {
      await cancelSubscription.mutateAsync(subscription.id)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{subscription.plan.name}</h3>
            <p className="text-sm text-muted-foreground">{subscription.plan.description}</p>
          </div>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Valor</p>
            <p className="font-medium">R$ {subscription.plan.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Renovação Automática</p>
            <p className="font-medium">{subscription.autoRenew ? "Sim" : "Não"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Data de Início</p>
            <p className="font-medium">
              {format(new Date(subscription.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Próximo Pagamento</p>
            <p className="font-medium">
              {subscription.nextPaymentDate
                ? format(new Date(subscription.nextPaymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : "-"}
            </p>
          </div>
        </div>

        {subscription.status === "active" && (
          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={handleCancel} disabled={cancelSubscription.isPending}>
              Cancelar Assinatura
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
