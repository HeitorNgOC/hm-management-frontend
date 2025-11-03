"use client"

import { useState } from "react"
import { useTemplates, useDeleteCampaign } from "@/hooks/use-marketing"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog } from "@/components/crud"
import { TemplateFormDialog } from "./template-form-dialog"

export function TemplateList() {
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useTemplates(page)
  const deleteTemplate = useDeleteCampaign()

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Templates</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Padrão</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTable rows={5} columns={4} />
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon="FileText"
                    title="Nenhum template encontrado"
                    description="Crie seu primeiro template de email"
                    action={{
                      label: "Novo Template",
                      onClick: () => setIsCreateOpen(true),
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>{template.isDefault && <Badge>Padrão</Badge>}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(template.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-destructive">
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
      </div>

      <TemplateFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {editingId && (
        <TemplateFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          templateId={editingId}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={() => {
          if (deleteConfirm.id) {
            deleteTemplate.mutateAsync(deleteConfirm.id)
          }
          setDeleteConfirm({ open: false })
        }}
        title="Remover template"
        description="Tem certeza que deseja remover este template?"
        isLoading={deleteTemplate.isPending}
      />
    </div>
  )
}
