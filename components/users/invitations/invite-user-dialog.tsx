"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePositions } from "@/hooks/use-positions"
import { useCreateInvitation } from "@/hooks/use-iam"
import { createInvitationSchema, type CreateInvitationFormData } from "@/lib/validations/iam"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const { data: positionsData, isError: isPositionsError, refetch: refetchPositions, isLoading: isPositionsLoading } =
    usePositions(1, 100, { enabled: open })
  const positionsPayload = positionsData as any
  const positions = Array.isArray(positionsPayload)
    ? positionsPayload
    : Array.isArray(positionsPayload?.data)
    ? positionsPayload.data
    : Array.isArray(positionsPayload?.items)
    ? positionsPayload.items
    : []
  const createInvitation = useCreateInvitation()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvitationFormData>({
    resolver: zodResolver(createInvitationSchema),
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: CreateInvitationFormData) => {
    const payload = {
      ...data,
      // backend expects uppercase role values (UserRole). Map if provided.
      role: data.role ? (data.role.toUpperCase() as any) : undefined,
    }

    await createInvitation.mutateAsync(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Convite</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="usuario@email.com" {...register("email")}
              disabled={isSubmitting || createInvitation.isPending}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input id="name" type="text" placeholder="Nome do usuário" {...register("name")}
              disabled={isSubmitting || createInvitation.isPending}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Papel (opcional)</Label>
              <Select onValueChange={(val) => setValue("role", val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Cargo (opcional)</Label>
              <Select onValueChange={(val) => setValue("positionId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder={isPositionsLoading ? "Carregando..." : isPositionsError ? "Erro ao carregar" : "Selecionar cargo"} />
                </SelectTrigger>
                <SelectContent>
                  {positions.length > 0 ? (
                    positions.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  ) : isPositionsError ? (
                    <div className="p-2 text-sm text-destructive">Erro ao carregar cargos</div>
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">Nenhum cargo disponível</div>
                  )}
                </SelectContent>
              </Select>
              {errors.positionId && <p className="text-sm text-destructive">{errors.positionId.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || createInvitation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || createInvitation.isPending}>
              {(isSubmitting || createInvitation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
