"use client"

import { useState } from "react"
import { useEnrollments, useDeleteEnrollment, useUpdateEnrollment } from "@/hooks/use-gym"
import { useGymClasses } from "@/hooks/use-gym"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog, DataTableWrapper } from "@/components/crud"
import { EnrollmentFormDialog } from "@/components/gym/enrollment-form-dialog"
import type { EnrollmentFilters, EnrollmentStatus } from "@/lib/types/gym"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusLabels: Record<EnrollmentStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
  suspended: "Suspensa",
  cancelled: "Cancelada",
}

const statusVariants: Record<EnrollmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  suspended: "outline",
  cancelled: "destructive",
}

export default function EnrollmentsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<EnrollmentFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useEnrollments(filters, page)
  const { data: classesData } = useGymClasses({}, 1, 100)
  const deleteEnrollment = useDeleteEnrollment()
  const updateEnrollment = useUpdateEnrollment()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleClassFilter = (classId: string) => {
    setFilters((prev) => ({ ...prev, classId: classId === "all" ? undefined : classId }))
    setPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status === "all" ? undefined : (status as EnrollmentStatus) }))
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteEnrollment.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  const handleStatusChange = async (id: string, status: EnrollmentStatus) => {
    await updateEnrollment.mutateAsync({ id, data: { status } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inscrições</h1>
          <p className="text-muted-foreground">Gerencie as inscrições dos alunos nas turmas</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
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
            <div className="flex gap-2 mb-4 px-4 pt-4">
              <Select onValueChange={handleClassFilter} defaultValue="all">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classesData?.data.map((gymClass) => (
                    <SelectItem key={gymClass.id} value={gymClass.id}>
                      {gymClass.name}
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
                  <SelectItem value="suspended">Suspensa</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
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
                        icon="Users"
                        title="Nenhuma inscrição encontrada"
                        description="Faça a primeira inscrição para começar"
                        action={{
                          label: "Nova Inscrição",
                          onClick: () => setIsCreateOpen(true),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{enrollment.client?.name}</div>
                          <div className="text-xs text-muted-foreground">{enrollment.client?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.class?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {enrollment.class?.modality?.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: enrollment.class.modality.color }}
                            />
                          )}
                          {enrollment.class?.modality?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(enrollment.enrollmentDate), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[enrollment.status]}>{statusLabels[enrollment.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingId(enrollment.id)}>Editar</DropdownMenuItem>
                            {enrollment.status === "active" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(enrollment.id, "suspended")}>
                                Suspender
                              </DropdownMenuItem>
                            )}
                            {enrollment.status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(enrollment.id, "active")}>
                                Reativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(enrollment.id)} className="text-destructive">
                              Cancelar Inscrição
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

      <EnrollmentFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setIsCreateOpen(false)}
      />

      {editingId && (
        <EnrollmentFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          enrollmentId={editingId}
          onSuccess={() => setEditingId(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Cancelar inscrição"
        description="Tem certeza que deseja cancelar esta inscrição? O aluno será removido da turma."
        isLoading={deleteEnrollment.isPending}
      />
    </div>
  )
}
