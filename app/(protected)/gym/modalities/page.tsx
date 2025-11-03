"use client"

import { useState } from "react"
import { useModalities, useDeleteModality } from "@/hooks/use-gym"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog, DataTableWrapper } from "@/components/crud"
import { ModalityFormDialog } from "@/components/gym/modality-form-dialog"
import type { ModalityFilters } from "@/lib/types/gym"

export default function ModalitiesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ModalityFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useModalities(filters, page)
  const deleteModality = useDeleteModality()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteModality.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modalidades</h1>
          <p className="text-muted-foreground">Gerencie as modalidades oferecidas na academia</p>
        </div>
      </div>

      <DataTableWrapper
        title=""
        searchPlaceholder="Buscar modalidades..."
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
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Máx. Alunos</TableHead>
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
                    icon="Dumbbell"
                    title="Nenhuma modalidade encontrada"
                    description="Crie sua primeira modalidade para começar"
                    action={{
                      label: "Nova Modalidade",
                      onClick: () => setIsCreateOpen(true),
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((modality) => (
                <TableRow key={modality.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {modality.color && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: modality.color }} />
                      )}
                      {modality.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{modality.description || "-"}</TableCell>
                  <TableCell>{modality.durationMinutes} min</TableCell>
                  <TableCell>{modality.maxStudentsPerClass}</TableCell>
                  <TableCell>
                    <Badge variant={modality.isActive ? "default" : "secondary"}>
                      {modality.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(modality.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(modality.id)} className="text-destructive">
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

      <ModalityFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      {editingId && (
        <ModalityFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          modalityId={editingId}
          onSuccess={() => setEditingId(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover modalidade"
        description="Tem certeza que deseja remover esta modalidade? Esta ação pode afetar turmas existentes."
        isLoading={deleteModality.isPending}
      />
    </div>
  )
}
