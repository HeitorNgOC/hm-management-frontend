"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateUser, useUpdateUser, useUser } from "@/hooks/use-users"
import { usePositions } from "@/hooks/use-positions"
import { createUserSchema, type CreateUserFormData } from "@/lib/validations/user"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { formatPhoneBR, normalizeEmail, formatCpf } from "@/lib/utils/mask"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
  onSuccess?: () => void
}

export function UserFormDialog({ open, onOpenChange, userId, onSuccess }: UserFormDialogProps) {
  const isEditing = !!userId
  const { data: userData } = useUser(userId || "")
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const positionsQuery = usePositions(1, 200)
  const positionsPayload = positionsQuery.data as any
  const positions = Array.isArray(positionsPayload)
    ? positionsPayload
    : Array.isArray(positionsPayload?.data)
    ? positionsPayload.data
    : Array.isArray(positionsPayload?.items)
    ? positionsPayload.items
    : []

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      positionId: "",
      role: "employee",
      hireDate: new Date().toISOString().split("T")[0],
      password: "",
    },
  })

  useEffect(() => {
    // Support double-wrapped envelopes (some endpoints occasionally return { data: { data: ... } })
    const maybe = (userData as any)?.data ?? (userData as any)
    const src = (maybe as any)?.data ?? maybe
    if (src) {
      // Normalize values coming from the service to the shape expected by the form
      const normalizedRole = typeof src.role === "string" ? (src.role.toLowerCase() as "admin" | "manager" | "employee") : ("employee" as const)
      const normalizedHireDate = src.hireDate ? src.hireDate.split("T")[0] : new Date().toISOString().split("T")[0]

      form.reset({
        name: src.name,
        email: src.email,
        phone: src.phone,
        cpf: src.cpf,
        positionId: src.positionId,
        role: normalizedRole,
        hireDate: normalizedHireDate,
        salary: src.salary ?? undefined,
        commission: src.commission ?? undefined,
        password: "",
      })
    }
  }, [userData, form])

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      if (isEditing) {
        const { password, ...updateData } = data
        // Normalize role to API expected enum (uppercase) before sending to service
        const apiUpdate = {
          ...updateData,
          role: typeof updateData.role === "string" ? (updateData.role.toUpperCase() as any) : updateData.role,
        }
        await updateUser.mutateAsync({ id: userId!, data: apiUpdate })
      } else {
        const apiCreate = {
          ...data,
          role: typeof data.role === "string" ? (data.role.toUpperCase() as any) : data.role,
        }
        await createUser.mutateAsync(apiCreate)
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(normalizeEmail(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(formatPhoneBR(e.target.value))}
                        inputMode="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} value={field.value || ""} onChange={(e) => field.onChange(formatCpf(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        // Ignore sentinel placeholder values (they are disabled but guard anyway)
                        if (v === '__loading' || v === '__no-positions') {
                          field.onChange("")
                        } else {
                          field.onChange(v)
                        }
                      }}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positionsQuery.isLoading && <SelectItem value="__loading" disabled>Carregando...</SelectItem>}
                        {positions.map((pos: any) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.name}
                          </SelectItem>
                        ))}
                        {!positionsQuery.isLoading && !positions.length && (
                          <SelectItem value="__no-positions" disabled>Nenhum cargo encontrado</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="employee">Funcionário</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Contratação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === "" ? undefined : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão % (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === "" ? undefined : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
