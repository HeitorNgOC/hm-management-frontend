"use client"

import { useState } from "react"
import { useInventoryItems, useDeleteInventoryItem } from "@/hooks/use-inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, AlertTriangle } from "lucide-react"
import { InventoryFormDialog } from "./inventory-form-dialog"
import { MovementDialog } from "./movement-dialog"
import type { InventoryFilters, InventoryItem } from "@/lib/types/inventory"

export function InventoryList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null)

  const { data, isLoading } = useInventoryItems(filters, page)
  const deleteItem = useDeleteInventoryItem()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      await deleteItem.mutateAsync(id)
    }
  }

  const getStatusBadge = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    }
    if (item.quantity <= item.minQuantity) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Estoque Baixo
        </Badge>
      )
    }
    return <Badge variant="default">Em Estoque</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estoque</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou SKU..."
          className="pl-9"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Preço Custo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name || "-"}</TableCell>
                  <TableCell>
                    <span className={item.quantity <= item.minQuantity ? "text-destructive font-medium" : ""}>
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground text-sm"> / {item.minQuantity} mín</span>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>R$ {item.costPrice.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setMovementItem(item)}>Movimentar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingItemId(item.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
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

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.pagination.currentPage} de {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <InventoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setIsCreateOpen(false)}
      />

      {editingItemId && (
        <InventoryFormDialog
          open={!!editingItemId}
          onOpenChange={(open) => !open && setEditingItemId(null)}
          itemId={editingItemId}
          onSuccess={() => setEditingItemId(null)}
        />
      )}

      {movementItem && (
        <MovementDialog
          open={!!movementItem}
          onOpenChange={(open) => !open && setMovementItem(null)}
          item={movementItem}
          onSuccess={() => setMovementItem(null)}
        />
      )}
    </div>
  )
}
