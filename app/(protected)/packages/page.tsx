"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, PackageIcon } from "lucide-react"
import { PackageFormDialog } from "@/components/packages/package-form-dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { packageService } from "@/lib/services/package.service"
import { EmptyState, BulkActionBar } from "@/components/crud"

export default function PackagesPage() {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", search],
    queryFn: () => packageService.getAll({ search }),
  })

  const deletePackage = useMutation({
    mutationFn: packageService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] })
    },
  })

  const bulkDelete = useMutation({
    mutationFn: packageService.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] })
      setSelectedIds([])
    },
  })

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    }
  }

  if (isLoading) {
    return <div className="p-4">Carregando...</div>
  }

  return (
    <ProtectedRoute requiredPermissions={["appointments.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pacotes</h1>
            <p className="text-muted-foreground">Combine serviços e produtos em pacotes com desconto</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pacote
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Pacotes</CardTitle>
                <CardDescription>Total: {packages?.length || 0} pacotes</CardDescription>
              </div>
              <Input
                placeholder="Buscar pacote..."
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

            {!packages || packages.length === 0 ? (
              <EmptyState
                title="Nenhum pacote cadastrado"
                description="Comece criando um pacote combinando serviços"
                actionLabel="Novo Pacote"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <PackageIcon className="h-4 w-4" />
                          <h3 className="font-semibold">{pkg.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="mt-3 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Itens:</span> {pkg.items.length}
                          </p>
                          <p className="text-lg font-bold">
                            R$ {pkg.price.toFixed(2)}
                            {pkg.discountPercentage && (
                              <span className="ml-2 text-sm text-green-600">-{pkg.discountPercentage}%</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingPackageId(pkg.id)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deletePackage.mutate(pkg.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <PackageFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />

        {editingPackageId && (
          <PackageFormDialog
            open={!!editingPackageId}
            onOpenChange={(open) => !open && setEditingPackageId(null)}
            packageId={editingPackageId!}
            onSuccess={() => setEditingPackageId(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
