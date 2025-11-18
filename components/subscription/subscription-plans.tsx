"use client"

import { useSubscriptionPlans, useCurrentSubscription, useCreateSubscription } from "@/hooks/use-subscription"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function SubscriptionPlans() {
  const { data: plans, isLoading } = useSubscriptionPlans()
  const { data: currentSubscription } = useCurrentSubscription()
  const createSubscription = useCreateSubscription()

  const handleSubscribe = async (planId: string) => {
    await createSubscription.mutateAsync({
      planId,
      paymentMethod: "credit_card",
      autoRenew: true,
    })
  }

  const getIntervalLabel = (interval: string) => {
    const labels = {
      monthly: "mês",
      quarterly: "trimestre",
      yearly: "ano",
    }
    return labels[interval as keyof typeof labels] || interval
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando planos...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
        <p className="text-muted-foreground">Escolha o plano ideal para o seu negócio</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id

          return (
            <Card key={plan.id} className={`p-6 ${isCurrentPlan ? "border-primary" : ""}`}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {isCurrentPlan && <Badge>Plano Atual</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div>
                  <div className="text-3xl font-bold">
                    R$ {plan.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{getIntervalLabel(plan.interval)}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || createSubscription.isPending}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isCurrentPlan ? "Plano Ativo" : "Assinar"}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
