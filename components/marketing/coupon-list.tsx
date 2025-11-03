"use client"

import { useState } from "react"
import { useCoupons, useDeleteCampaign } from "@/hooks/use-marketing"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog } from "@/components/crud"
import { CouponFormDialog } from "./coupon-form-dialog"

export function CouponList() {
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useCoupons({}, page)
  const deleteCoupon = useDeleteCampaign()

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cupons</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cupom
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTable rows={5} columns={5} />
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon="Tag"
                    title="Nenhum cupom encontrado"
                    description="Crie seu primeiro cupom de desconto"
                    action={{
                      label: "Novo Cupom",
                      onClick: () => setIsCreateOpen(true),
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {coupon.currentUses}/{coupon.maxUses || "∞"}
                  </TableCell>
                  <TableCell>{coupon.isActive && <Badge>Ativo</Badge>}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(coupon.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(coupon.id)} className="text-destructive">
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

      <CouponFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {editingId && (
        <CouponFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          couponId={editingId}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={() => {
          if (deleteConfirm.id) {
            deleteCoupon.mutateAsync(deleteConfirm.id)
          }
          setDeleteConfirm({ open: false })
        }}
        title="Remover cupom"
        description="Tem certeza que deseja remover este cupom?"
        isLoading={deleteCoupon.isPending}
      />
    </div>
  )
}
