"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  useEmployeeTimeIntervalsByEmployeeId,
  useCreateEmployeeTimeInterval,
} from "@/hooks/use-employee-time-intervals"
import { TimeIntervalForm } from "@/components/employee-time-intervals/time-interval-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function EmployeeTimeIntervalsPage() {
  const { user } = useAuth()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(user?.id || "")
  const { data: timeIntervals, isLoading } = useEmployeeTimeIntervalsByEmployeeId(selectedEmployeeId)
  const createTimeInterval = useCreateEmployeeTimeInterval()

  const handleSubmit = async (data: any) => {
    await createTimeInterval.mutateAsync({
      ...data,
      employeeId: selectedEmployeeId,
    })
  }

  return (
    <ProtectedRoute requiredPermissions={["users.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Horários de Trabalho</h1>
          <p className="text-muted-foreground">Configure os horários de trabalho dos funcionários</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Horário</CardTitle>
                <CardDescription>Configure um novo horário de trabalho</CardDescription>
              </CardHeader>
              <CardContent>
                <TimeIntervalForm
                  employeeId={selectedEmployeeId}
                  onSubmit={handleSubmit}
                  isLoading={createTimeInterval.isPending}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Horários Configurados</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : timeIntervals && timeIntervals.length > 0 ? (
                  <div className="space-y-3">
                    {timeIntervals.map((interval) => (
                      <div key={interval.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium capitalize">
                            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][interval.dayOfWeek]}
                          </p>
                          {interval.isWorkDay ? (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {interval.startTime} - {interval.endTime}
                              </p>
                              {interval.breakStartTime && (
                                <p className="text-xs text-muted-foreground">
                                  Intervalo: {interval.breakStartTime} - {interval.breakEndTime}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-red-600">Folga</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum horário configurado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
