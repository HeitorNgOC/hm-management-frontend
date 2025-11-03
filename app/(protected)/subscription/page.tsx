import { ProtectedRoute } from "@/components/auth/protected-route"
import { CurrentSubscription } from "@/components/subscription/current-subscription"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { PaymentHistory } from "@/components/subscription/payment-history"

export default function SubscriptionPage() {
  return (
    <ProtectedRoute requiredPermissions={["settings.view"]}>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Assinatura e Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie sua assinatura e histórico de pagamentos</p>
        </div>

        <CurrentSubscription />
        <SubscriptionPlans />
        <PaymentHistory />
      </div>
    </ProtectedRoute>
  )
}
