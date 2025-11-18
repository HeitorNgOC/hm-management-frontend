"use client"

import { useState } from "react"
import { useQueueTickets, useQueueDesks, useQueueStats, useCallNext, useCompleteService } from "@/hooks/use-queue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { TicketFormDialog } from "@/components/queue/ticket-form-dialog"
import type { QueuePriority, QueueStatus } from "@/lib/types/queue"

const priorityLabels: Record<QueuePriority, string> = {
  normal: "Normal",
  priority: "Prioritário",
  urgent: "Urgente",
}

const priorityVariants: Record<QueuePriority, "default" | "secondary" | "destructive"> = {
  normal: "default",
  priority: "secondary",
  urgent: "destructive",
}

const statusLabels: Record<QueueStatus, string> = {
  waiting: "Aguardando",
  called: "Chamado",
  in_service: "Em Atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não Compareceu",
}

export default function QueueDashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  const { data: ticketsData } = useQueueTickets({ status: "waiting", date: today }, 1, 50)
  const { data: desksData } = useQueueDesks({ isActive: true }, 1, 20)
  const { data: statsData } = useQueueStats(today)
  const callNext = useCallNext()
  const completeService = useCompleteService()

  const handleCallNext = async (deskId: string) => {
    await callNext.mutateAsync({ deskId })
  }

  const handleCompleteService = async (deskId: string) => {
    await completeService.mutateAsync(deskId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guichê de Atendimento</h1>
          <p className="text-muted-foreground">Gerencie a fila de atendimento em tempo real</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>Gerar Nova Senha</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalWaiting || 0}</div>
            <p className="text-xs text-muted-foreground">Pessoas na fila</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalInService || 0}</div>
            <p className="text-xs text-muted-foreground">Atendimentos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">Atendimentos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.averageWaitTime || 0} min</div>
            <p className="text-xs text-muted-foreground">Tempo de espera</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fila de Espera</CardTitle>
            <CardDescription>Clientes aguardando atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {ticketsData?.data.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente na fila</p>
              ) : (
                ticketsData?.data.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{ticket.ticketNumber}</span>
                        <Badge variant={priorityVariants[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                      </div>
                      <p className="text-sm font-medium">{ticket.client?.name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.checkInTime).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {ticket.estimatedWaitTime && (
                        <p className="text-xs text-muted-foreground">~{ticket.estimatedWaitTime} min</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guichês</CardTitle>
            <CardDescription>Status dos guichês de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {desksData?.data.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum guichê ativo</p>
              ) : (
                desksData?.data.map((desk) => (
                  <div key={desk.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          Guichê {desk.deskNumber} - {desk.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{desk.attendant?.name || "Sem atendente"}</p>
                      </div>
                      <Badge
                        variant={
                          desk.status === "available" ? "default" : desk.status === "busy" ? "secondary" : "outline"
                        }
                      >
                        {desk.status === "available"
                          ? "Disponível"
                          : desk.status === "busy"
                            ? "Ocupado"
                            : desk.status === "paused"
                              ? "Pausado"
                              : "Offline"}
                      </Badge>
                    </div>

                    {desk.currentTicket && (
                      <div className="mb-3 p-2 bg-muted rounded">
                        <p className="text-sm font-medium">
                          Senha: {desk.currentTicket.ticketNumber} - {desk.currentTicket.client?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{desk.currentTicket.serviceType}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {desk.status === "available" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCallNext(desk.id)}
                          disabled={callNext.isPending}
                        >
                          Chamar Próximo
                        </Button>
                      )}
                      {desk.status === "busy" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleCompleteService(desk.id)}
                          disabled={completeService.isPending}
                        >
                          Finalizar Atendimento
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TicketFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />
    </div>
  )
}
