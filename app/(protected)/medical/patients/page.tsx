"use client"

import { useState } from "react"
import { usePatients, useDeletePatient } from "@/hooks/use-medical-record"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog, DataTableWrapper } from "@/components/crud"
import { PatientFormDialog } from "@/components/medical/patient-form-dialog"
import type { PatientFilters } from "@/lib/types/medical-record"

export default function PatientsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<PatientFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = usePatients(filters, page)
  const deletePatient = useDeletePatient()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleSpeciesFilter = (species: string) => {
    setFilters((prev) => ({ ...prev, species: species === "all" ? undefined : species }))
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deletePatient.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de pacientes</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <DataTableWrapper
            title=""
            searchPlaceholder="Buscar pacientes..."
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
              <Select onValueChange={handleSpeciesFilter} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as espécies</SelectItem>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="bird">Pássaro</SelectItem>
                  <SelectItem value="rabbit">Coelho</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie/Raça</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Contato</TableHead>
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
                        icon="Users"
                        title="Nenhum paciente encontrado"
                        description="Cadastre o primeiro paciente para começar"
                        action={{
                          label: "Novo Paciente",
                          onClick: () => setIsCreateOpen(true),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        {patient.species && patient.breed
                          ? `${patient.species} - ${patient.breed}`
                          : patient.species || "-"}
                      </TableCell>
                      <TableCell>
                        {patient.birthDate
                          ? `${Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} anos`
                          : "-"}
                      </TableCell>
                      <TableCell>{patient.owner?.name || "-"}</TableCell>
                      <TableCell>{patient.owner?.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={patient.isActive ? "default" : "secondary"}>
                          {patient.isActive ? "Ativo" : "Inativo"}
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
                            <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingId(patient.id)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(patient.id)} className="text-destructive">
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

      <PatientFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      {editingId && (
        <PatientFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          patientId={editingId}
          onSuccess={() => setEditingId(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover paciente"
        description="Tem certeza que deseja remover este paciente? O histórico médico será mantido."
        isLoading={deletePatient.isPending}
      />
    </div>
  )
}
