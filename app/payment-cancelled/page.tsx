"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, Home, ArrowLeft } from "lucide-react"

export default function PaymentCancelledPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") || "cancelled"

  const reasonMessages: Record<string, string> = {
    cancelled: "Você cancelou o pagamento",
    failed: "O pagamento falhou. Por favor, tente novamente",
    expired: "A sessão de pagamento expirou",
    declined: "Seu pagamento foi recusado. Por favor, verifique seus dados",
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Pagamento Cancelado</CardTitle>
          <CardDescription>{reasonMessages[reason] || reasonMessages.cancelled}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">
              Se você tiver dúvidas sobre o pagamento ou precisar de ajuda, entre em contato com nosso suporte.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
