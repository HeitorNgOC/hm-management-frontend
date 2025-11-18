import React from "react"
import useClient from "@/hooks/use-client"
import ClientSidebar from "@/components/client/client-sidebar"

export default function ClientDashboardPage() {
  const { data: client, isLoading } = useClient()

  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold">Área do Cliente</h1>
        {isLoading ? (
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        ) : (
          <div className="mt-4">
            <p className="font-medium">Olá, {client?.name ?? client?.email ?? 'cliente'}.</p>
            <p className="text-sm text-muted-foreground mt-1">E-mail: {client?.email ?? '—'}</p>
            <div className="mt-6 p-4 border rounded">
              <h2 className="font-semibold">Agendamentos</h2>
              <p className="text-sm text-muted-foreground mt-2">(placeholder) Lista de agendamentos do cliente aparecerá aqui.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
