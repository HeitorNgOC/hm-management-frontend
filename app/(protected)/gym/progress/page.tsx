"use client"

import { useState } from "react"
import { useProgress, useDeleteProgress } from "@/hooks/use-workout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog, DataTableWrapper } from "@/components/crud"
import { ProgressFormDialog } from "@/components/gym/progress-form-dialog"
import type { ProgressFilters } from "@/lib/types/workout"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ProgressPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProgressFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useProgress(filters, page)
  const deleteProgress = useDeleteProgress()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteProgress.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evolução dos Alunos</h1>
          <p className="text-muted-foreground">Acompanhe o progresso e evolução física dos alunos</p>
        </div>
      </div>

      <DataTableWrapper
        title=""
        searchPlaceholder="Buscar por aluno..."
        onSearch={handleSearch}
        onAddNew={() => setIsCreateOpen(true)}
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
              <TableHead>Data</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Peso (kg)</TableHead>
              <TableHead>Gordura (%)</TableHead>
              <TableHead>Massa Muscular (kg)</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTable rows={5} columns={7} />
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    icon="TrendingUp"
                    title="Nenhum registro de evolução encontrado"
                    description="Registre a primeira evolução para começar"
                    action={{
                      label: "Novo Registro",
                      onClick: () => setIsCreateOpen(true),
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((progress) => (
                <TableRow key={progress.id}>
                  <TableCell>{format(new Date(progress.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell className="font-medium">Cliente {progress.clientId}</TableCell>
                  <TableCell>{progress.weight ? `${progress.weight} kg` : "-"}</TableCell>
                  <TableCell>{progress.bodyFat ? `${progress.bodyFat}%` : "-"}</TableCell>
                  <TableCell>{progress.muscleMass ? `${progress.muscleMass} kg` : "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{progress.notes || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(progress.id)} className="text-destructive">
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

      <ProgressFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover registro de evolução"
        description="Tem certeza que deseja remover este registro?"
        isLoading={deleteProgress.isPending}
      />
    </div>
  )
}
