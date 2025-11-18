"use client"

import { useState } from "react"
import { usePositions, useDeletePosition } from "@/hooks/use-positions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Shield } from "lucide-react"
import { PositionFormDialog } from "./position-form-dialog"

export function PositionList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)

  const { data, isLoading } = usePositions()
  const deletePosition = useDeletePosition()

  const payload = data as any
  const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.items ?? []

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este cargo?")) {
      await deletePosition.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cargos e Permissões</h2>
          <p className="text-muted-foreground">Gerencie os cargos e suas permissões no sistema</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum cargo encontrado
                </TableCell>
              </TableRow>
            ) : (
              rows.map((position: any) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {position.name}
                      {position.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Padrão
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{position.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{position.permissions.length} permissões</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingPositionId(position.id)}>Editar</DropdownMenuItem>
                        {!position.isDefault && (
                          <DropdownMenuItem onClick={() => handleDelete(position.id)} className="text-destructive">
                            Remover
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PositionFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      {editingPositionId && (
        <PositionFormDialog
          open={!!editingPositionId}
          onOpenChange={(open) => !open && setEditingPositionId(null)}
          positionId={editingPositionId}
          onSuccess={() => setEditingPositionId(null)}
        />
      )}
    </div>
  )
}
