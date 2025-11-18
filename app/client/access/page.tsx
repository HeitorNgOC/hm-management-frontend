"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useClientAuth } from "@/contexts/client-auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ClientAccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { exchangeMagicToken, isLoading, isAuthenticated } = useClientAuth()
  const { toast } = useToast()

  useEffect(() => {
    const token = params?.get("token") ?? params?.get("t")
    if (!token) {
      toast({ title: "Link inválido", description: "Token ausente na URL" })
      return
    }

    let mounted = true

    ;(async () => {
      try {
        await exchangeMagicToken(token)
        if (!mounted) return
        router.replace("/client/dashboard")
      } catch (e) {
        toast({ title: "Erro no link", description: "Não foi possível validar o link" })
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // show a small status UI while exchanging
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium">Acessando sua conta...</h2>
        <p className="text-sm text-muted-foreground mt-2">Aguarde enquanto validamos o link de acesso.</p>
      </div>
    </div>
  )
}
