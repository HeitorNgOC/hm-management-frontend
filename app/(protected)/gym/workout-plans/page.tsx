"use client"

import { useState } from "react"
import { useWorkoutPlans, useDeleteWorkoutPlan } from "@/hooks/use-workout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog, DataTableWrapper } from "@/components/crud"
import type { WorkoutPlanFilters, WorkoutPlanStatus } from "@/lib/types/workout"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusLabels: Record<WorkoutPlanStatus, string> = {
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
}

const statusVariants: Record<WorkoutPlanStatus, "default" | "secondary" | "destructive"> = {
  active: "default",
  completed: "secondary",
  cancelled: "destructive",
}

export default function WorkoutPlansPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<WorkoutPlanFilters>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useWorkoutPlans(filters, page)
  const deleteWorkoutPlan = useDeleteWorkoutPlan()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteWorkoutPlan.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planos de Treino</h1>
          <p className="text-muted-foreground">Gerencie os planos de treino dos alunos</p>
        </div>
      </div>

      <DataTableWrapper
        title=""
        searchPlaceholder="Buscar por aluno..."
        onSearch={handleSearch}
        onAddNew={() => {}}
        isLoading={isLoading}
        pagination={
          data
            ? {
                currentPage: data.pagination.page,
                totalPages: data.pagination.totalPages,
                totalCount: data.pagination.total,
              }
            : undefined
        }
        onPageChange={setPage}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Instrutor</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTable rows={5} columns={6} />
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon="ClipboardList"
                    title="Nenhum plano de treino encontrado"
                    description="Crie o primeiro plano de treino para começar"
                    action={{
                      label: "Novo Plano",
                      onClick: () => {},
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.client?.name || "-"}</TableCell>
                  <TableCell>{plan.instructor?.name || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.goal || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(plan.startDate), "dd/MM/yyyy", { locale: ptBR })}
                      {plan.endDate && ` - ${format(new Date(plan.endDate), "dd/MM/yyyy", { locale: ptBR })}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[plan.status]}>{statusLabels[plan.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableWrapper>

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover plano de treino"
        description="Tem certeza que deseja remover este plano de treino?"
        isLoading={deleteWorkoutPlan.isPending}
      />
    </div>
  )
}
