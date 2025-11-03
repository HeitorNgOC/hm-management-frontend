"use client"

import { useState } from "react"
import { useGymClasses, useDeleteGymClass } from "@/hooks/use-gym"
import { useModalities } from "@/hooks/use-gym"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Users } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog, DataTableWrapper } from "@/components/crud"
import { GymClassFormDialog } from "@/components/gym/gym-class-form-dialog"
import type { GymClassFilters, ClassStatus } from "@/lib/types/gym"

const statusLabels: Record<ClassStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
  full: "Lotada",
  cancelled: "Cancelada",
}

const statusVariants: Record<ClassStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  full: "outline",
  cancelled: "destructive",
}

export default function GymClassesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<GymClassFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useGymClasses(filters, page)
  const { data: modalitiesData } = useModalities({}, 1, 100)
  const deleteGymClass = useDeleteGymClass()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleModalityFilter = (modalityId: string) => {
    setFilters((prev) => ({ ...prev, modalityId: modalityId === "all" ? undefined : modalityId }))
    setPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status === "all" ? undefined : (status as ClassStatus) }))
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteGymClass.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  const getDayName = (day: number) => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    return days[day]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">Gerencie as turmas e horários das aulas</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <DataTableWrapper
            title=""
            searchPlaceholder="Buscar turmas..."
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
            <div className="flex gap-2 mb-4 px-4 pt-4">
              <Select onValueChange={handleModalityFilter} defaultValue="all">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas modalidades</SelectItem>
                  {modalitiesData?.data.map((modality) => (
                    <SelectItem key={modality.id} value={modality.id}>
                      {modality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={handleStatusFilter} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                  <SelectItem value="full">Lotada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Horários</TableHead>
                  <TableHead>Instrutores</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Status</TableHead>
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
                        icon="Calendar"
                        title="Nenhuma turma encontrada"
                        description="Crie sua primeira turma para começar"
                        action={{
                          label: "Nova Turma",
                          onClick: () => setIsCreateOpen(true),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((gymClass) => (
                    <TableRow key={gymClass.id}>
                      <TableCell className="font-medium">{gymClass.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {gymClass.modality?.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: gymClass.modality.color }}
                            />
                          )}
                          {gymClass.modality?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {gymClass.schedule.slice(0, 2).map((schedule, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {getDayName(schedule.dayOfWeek)} {schedule.startTime}
                            </Badge>
                          ))}
                          {gymClass.schedule.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{gymClass.schedule.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{gymClass.instructors?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {gymClass.currentStudents}/{gymClass.maxStudents}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[gymClass.status]}>{statusLabels[gymClass.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingId(gymClass.id)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(gymClass.id)} className="text-destructive">
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
        </div>
      </div>

      <GymClassFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      {editingId && (
        <GymClassFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          classId={editingId}
          onSuccess={() => setEditingId(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover turma"
        description="Tem certeza que deseja remover esta turma? Todas as inscrições serão canceladas."
        isLoading={deleteGymClass.isPending}
      />
    </div>
  )
}
