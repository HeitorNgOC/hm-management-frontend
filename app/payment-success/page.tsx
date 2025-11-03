"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Home, Download } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get("transaction_id")

  useEffect(() => {
    // TODO: Verify payment status from backend
  }, [transactionId])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Pagamento Confirmado</CardTitle>
          <CardDescription>Sua transação foi processada com sucesso</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">ID da Transação</p>
              <p className="font-mono text-sm font-medium break-all">{transactionId || "Processando..."}</p>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">
              Obrigado pela sua compra. Você receberá um email de confirmação em breve.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Baixar Recibo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
