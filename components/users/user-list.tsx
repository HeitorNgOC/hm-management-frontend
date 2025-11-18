"use client"

import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUsers, useDeleteUser } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { UserFormDialog } from "./user-form-dialog"
import { UserStatusBadge } from "./user-status-badge"
import { EmptyState, SkeletonTable, BulkActionBar, ConfirmDeleteDialog } from "@/components/crud"
import type { UserFilters, UserRole, UserStatus } from "@/lib/types/user"
import { InviteUserDialog } from "@/components/users/invitations/invite-user-dialog"
import { InvitationList } from "@/components/users/invitations/invitation-list"

export function UserList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<UserFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false })

  const { data, isLoading, isError, refetch } = useUsers(filters, page)
  // Support both shapes: some hooks return PaginatedResponse (with .data) and
  // others may return raw arrays. Be defensive to avoid runtime crashes.
  const payload = data as any
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? (payload.data as any[])
    : Array.isArray(payload?.items)
    ? (payload.items as any[])
    : []
  const invalidData = !!data && !Array.isArray(payload) && !Array.isArray(payload?.data) && !Array.isArray(payload?.items)
  const totalPages = (payload?.pagination?.totalPages as number) ?? 0
  const currentPage = (payload?.pagination?.page as number) ?? page
  const deleteUser = useDeleteUser()

  const allSelected = useMemo(() => (rows.length ? selectedIds.size === rows.length : false), [selectedIds, rows.length])

  const handleSearch = (search: string) => {
    const next = { ...(filters || {}), search }
    if (!validateFilters(next)) return
    setFilters(next)
    setPage(1)
  }

  const handleRoleFilter = (role: UserRole | "all") => {
    const next = { ...(filters || {}), role: role === "all" ? undefined : role }
    if (!validateFilters(next)) return
    setFilters(next)
    setPage(1)
  }

  const handleStatusFilter = (status: UserStatus | "all") => {
    const next = { ...(filters || {}), status: status === "all" ? undefined : status }
    if (!validateFilters(next)) return
    setFilters(next)
    setPage(1)
  }

  const { toast } = useToast()

  // Validate filters before applying them to avoid sending invalid payloads to the service
  function validateFilters(candidate: UserFilters) {
    // search: optional string, max length 200
    if (candidate.search && typeof candidate.search !== "string") {
      toast({ title: "Filtro inválido", description: "O termo de busca deve ser um texto." })
      return false
    }
    if (candidate.search && candidate.search.length > 200) {
      toast({ title: "Filtro inválido", description: "O termo de busca é muito longo (máx 200 caracteres)." })
      return false
    }

    // role: if present, must be one of the allowed values
    if (candidate.role) {
      const allowed = ["admin", "manager", "employee"]
      if (!allowed.includes(candidate.role as string)) {
        toast({ title: "Filtro inválido", description: "Papel inválido selecionado." })
        return false
      }
    }

    // status: if present, must be one of the allowed statuses
    if (candidate.status) {
      const allowedStatus = ["active", "inactive", "on_leave"]
      if (!allowedStatus.includes(candidate.status as string)) {
        toast({ title: "Filtro inválido", description: "Status inválido selecionado." })
        return false
      }
    }

    return true
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteUser.mutateAsync(deleteConfirm.id)
      setDeleteConfirm({ open: false })
    }
  }

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteUser.mutateAsync(id)
    }
    setSelectedIds(new Set())
  }

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(rows.map((u: any) => u.id)))
    }
  }

  const handleSelectUser = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuários</h2>
        <div className="flex gap-2">
          <InviteUserDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-9"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select onValueChange={handleRoleFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="employee">Funcionário</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="on_leave">De Férias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={rows.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          actions={[
            {
              label: "Remover selecionados",
              variant: "destructive",
              onClick: handleBulkDelete,
              isLoading: deleteUser.isPending,
            },
          ]}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded"
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTable rows={5} columns={7} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    icon="AlertTriangle"
                    title="Erro ao carregar usuários"
                    description="Não foi possível carregar a lista agora. Tente novamente."
                    action={{ label: "Tentar novamente", onClick: () => refetch() }}
                  />
                </TableCell>
              </TableRow>
            ) : invalidData ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    icon="AlertTriangle"
                    title="Formato de dados inesperado"
                    description="A resposta não está no formato esperado. Tente novamente."
                    action={{ label: "Recarregar", onClick: () => refetch() }}
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    icon="Users"
                    title="Nenhum usuário encontrado"
                    description="Crie seu primeiro usuário para começar"
                    action={{
                      label: "Novo Usuário",
                      onClick: () => setIsCreateOpen(true),
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user: any) => (
                <TableRow key={user.id} className={selectedIds.has(user.id) ? "bg-muted" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                      aria-label={`Selecionar ${user.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.position?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === "admin" ? "Admin" : user.role === "manager" ? "Gerente" : "Funcionário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUserId(user.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <UserFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

      {editingUserId && (
        <UserFormDialog
          open={!!editingUserId}
          onOpenChange={(open) => !open && setEditingUserId(null)}
          userId={editingUserId}
          onSuccess={() => setEditingUserId(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        onConfirm={handleConfirmDelete}
        title="Remover usuário"
        description="Tem certeza que deseja remover este usuário? Esta ação pode ser desfeita."
        isLoading={deleteUser.isPending}
      />

      <div className="pt-8">
        <InvitationList />
      </div>
    </div>
  )
}
