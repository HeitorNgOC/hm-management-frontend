"use client"

import { useMemo, useState } from "react"
import { useInvitations, useDeleteInvitation, useResendInvitation } from "@/hooks/use-iam"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState, SkeletonTable, ConfirmDeleteDialog } from "@/components/crud"
import type { InvitationFilters } from "@/lib/types/iam"
import { Mail, RefreshCw, Trash2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function InvitationList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<InvitationFilters>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading, isError, refetch } = useInvitations(filters, page)
  const deleteInvitation = useDeleteInvitation()
  const resendInvitation = useResendInvitation()

  const rows = Array.isArray(data?.data) ? (data!.data as any[]) : []
  const invalidData = !!data && !Array.isArray(data?.data)
  const totalPages = data?.pagination?.totalPages || 1

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPage(1)
  }

  const handleStatusFilter = (status: NonNullable<InvitationFilters["status"]> | "all") => {
    setFilters((prev) => ({ ...prev, status: status === "all" ? undefined : status }))
    setPage(1)
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant?: any }> = {
      pending: { label: "Pendente" },
      accepted: { label: "Aceito" },
      expired: { label: "Expirado", variant: "secondary" },
      revoked: { label: "Revogado", variant: "outline" },
    }
    const s = map[status] || { label: status }
    return <Badge variant={s.variant as any}>{s.label}</Badge>
  }

  const handleDelete = (id: string) => setDeleteConfirm({ open: true, id })
  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteInvitation.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Convites</h3>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por email ou nome..." className="pl-9" onChange={(e) => handleSearch(e.target.value)} />
        </div>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="accepted">Aceito</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="revoked">Revogado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTable rows={4} columns={6} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon="AlertTriangle"
                    title="Erro ao carregar convites"
                    description="Não foi possível carregar os convites agora. Tente novamente."
                    action={{ label: "Tentar novamente", onClick: () => refetch() }}
                  />
                </TableCell>
              </TableRow>
            ) : invalidData ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon="AlertTriangle"
                    title="Formato de dados inesperado"
                    description="A resposta não está no formato esperado. Recarregue a página."
                    action={{ label: "Recarregar", onClick: () => refetch() }}
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon="MailPlus"
                    title="Nenhum convite"
                    description="Envie convites para adicionar usuários à sua empresa"
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell>{inv.name || "-"}</TableCell>
                  <TableCell>{inv.role ? (inv.role === "admin" ? "Admin" : inv.role === "manager" ? "Gerente" : "Funcionário") : "-"}</TableCell>
                  <TableCell>{inv.expiresAt ? new Date(inv.expiresAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>{statusBadge(inv.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendInvitation.mutate(inv.id)}
                        disabled={resendInvitation.isPending || inv.status !== "pending"}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Reenviar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(inv.id)}
                        disabled={deleteInvitation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Revogar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.pagination.page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Revogar convite"
        description="Tem certeza que deseja revogar este convite? O link será invalidado imediatamente."
        isLoading={deleteInvitation.isPending}
      />
    </div>
  )
}
