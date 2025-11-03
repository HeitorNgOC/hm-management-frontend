"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { PermissionGate } from "@/components/auth/permission-gate"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Settings, FileText, DollarSign } from "lucide-react"

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gestão completa do sistema</p>
          </div>
          <Button onClick={logout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo, {user?.name}</CardTitle>
              <CardDescription>Você está logado como Administrador</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PermissionGate permissions={["users.view"]}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Gerenciar usuários do sistema</p>
              </CardContent>
            </Card>
          </PermissionGate>

          <PermissionGate permissions={["settings.view"]}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Configurações</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Configurações da empresa</p>
              </CardContent>
            </Card>
          </PermissionGate>

          <PermissionGate permissions={["reports.view"]}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Visualizar relatórios</p>
              </CardContent>
            </Card>
          </PermissionGate>

          <PermissionGate permissions={["financial.view"]}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financeiro</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Gestão financeira</p>
              </CardContent>
            </Card>
          </PermissionGate>
        </div>
      </div>
    </ProtectedRoute>
  )
}
