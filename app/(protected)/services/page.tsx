"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { serviceService } from "@/lib/services/service.service"
import { ServiceFormDialog } from "@/components/services/service-form-dialog"
import { EmptyState, SkeletonTable, BulkActionBar } from "@/components/crud"

export default function ServicesPage() {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", search],
    queryFn: () => serviceService.getAll({ search }),
  })

  const deleteService = useMutation({
    mutationFn: serviceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })

  const bulkDelete = useMutation({
    mutationFn: serviceService.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      setSelectedIds([])
    },
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked && services) {
      setSelectedIds(services.map((s) => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    }
  }

  // Render the page normally and show the skeleton where the list is to avoid emitting
  // <tr> elements directly under a <div> (which causes hydration errors).

  return (
    <ProtectedRoute requiredPermissions={["appointments.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Serviços</h1>
            <p className="text-muted-foreground">Gerencie os serviços disponíveis</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Serviços</CardTitle>
                <CardDescription>Total: {services?.length || 0} serviços</CardDescription>
              </div>
              <Input
                placeholder="Buscar serviço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>

          <CardContent>
            {selectedIds.length > 0 && (
              <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={() => bulkDelete.mutate(selectedIds)}
                onCancel={() => setSelectedIds([])}
              />
            )}

            {isLoading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <SkeletonTable rows={5} columns={3} />
                  </tbody>
                </table>
              </div>
            ) : !services || services.length === 0 ? (
              <EmptyState
                title="Nenhum serviço cadastrado"
                description="Comece adicionando um novo serviço para sua empresa"
                actionLabel="Novo Serviço"
              />
            ) : (
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(service.id)}
                        onChange={(e) => handleSelectOne(service.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} min • R$ {service.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingServiceId(service.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteService.mutate(service.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        <ServiceFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

        {editingServiceId && (
          <ServiceFormDialog
            open={!!editingServiceId}
            onOpenChange={(open) => !open && setEditingServiceId(null)}
            serviceId={editingServiceId!}
            onSuccess={() => setEditingServiceId(null)}
          />
        )}
    </ProtectedRoute>
  )
}
