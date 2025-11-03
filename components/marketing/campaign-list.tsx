"use client"

import { useState } from "react"
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-marketing"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus } from "lucide-react"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog } from "@/components/crud"
import { CampaignFormDialog } from "./campaign-form-dialog"
import { CampaignStatusBadge } from "./campaign-status-badge"
import type { MarketingFilters } from "@/lib/types/marketing"

export function CampaignList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<MarketingFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading } = useCampaigns(filters, page)
  const deleteCampaign = useDeleteCampaign()

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteCampaign.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Campanhas</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enviados</TableHead>
              <TableHead>Taxa de Abertura</TableHead>
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
                    icon="Zap"
                    title="Nenhuma campanha encontrada"
                    description="Crie sua primeira campanha de marketing"
                    action={{
                      label: "Nova Campanha",
                      onClick: () => setIsCreateOpen(true),
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.type === "email" ? "Email" : campaign.type === "sms" ? "SMS" : "Push"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <CampaignStatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell>{campaign.metrics.sent}</TableCell>
                  <TableCell>
                    {campaign.metrics.sent > 0
                      ? `${Math.round((campaign.metrics.opened / campaign.metrics.sent) * 100)}%`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingId(campaign.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-destructive">
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

      <CampaignFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {editingId && (
        <CampaignFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          campaignId={editingId}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover campanha"
        description="Tem certeza que deseja remover esta campanha?"
        isLoading={deleteCampaign.isPending}
      />
    </div>
  )
}
