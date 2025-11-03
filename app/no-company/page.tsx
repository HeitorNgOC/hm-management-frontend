"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Mail, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function NoCompanyPage() {
  const { user, logout } = useAuth()

  const handleRequestAccess = async () => {
    // TODO: Implement email request to admin for company access
    console.log("Requesting access for:", user?.email)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-2xl font-bold">Sem Empresa Vinculada</CardTitle>
          </div>
          <CardDescription>Você precisa ser vinculado a uma empresa para acessar o sistema</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Sua conta está ativa, mas você não está vinculado a nenhuma empresa. Entre em contato com um administrador
              para ser adicionado a uma empresa.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Como proceder:</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Você será adicionado por um administrador da empresa</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Peça ao administrador que convide você usando este email</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Você receberá uma confirmação por email</span>
              </li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Email da conta:</p>
            <p className="font-mono text-sm font-medium">{user?.email}</p>
          </div>

          <Button onClick={handleRequestAccess} className="w-full bg-transparent" variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Solicitar Acesso a Empresa
          </Button>
        </CardContent>

        <div className="border-t p-4">
          <Button onClick={logout} variant="ghost" className="w-full justify-between">
            <span>Sair da conta</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
