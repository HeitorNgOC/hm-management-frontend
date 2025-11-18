"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClientSchema, type CreateClientFormData, updateClientSchema } from "@/lib/validations/client"
import { useCreateClient, useUpdateClient, useClient } from "@/hooks/use-clients"
import { clientService } from "@/lib/services/client.service"
import { useToast } from "@/hooks/use-toast"
import { normalizeEmail, formatPhoneBR } from "@/lib/utils/mask"

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId?: string
  onSuccess?: () => void
}

export function ClientFormDialog({ open, onOpenChange, clientId, onSuccess }: ClientFormDialogProps) {
  const isEditing = !!clientId
  const { data: clientData, isLoading: isLoadingClient } = useClient(clientId)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()

  const schema = isEditing ? updateClientSchema : createClientSchema

  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      cnpj: "",
      type: "individual" as any,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      birthDate: "",
      gender: "",
      notes: "",
    },
  })

  const [sendMagicLink, setSendMagicLink] = useState(true)
  const { toast } = useToast()

  // Reset form with client data when editing
  useEffect(() => {
    if (isEditing && clientData && open) {
      form.reset({
        name: clientData.name ?? "",
        email: clientData.email ?? "",
        phone: clientData.phone ?? "",
        cpf: clientData.cpf ?? "",
        cnpj: clientData.cnpj ?? "",
        type: clientData.type ?? "individual",
        address: clientData.address ?? "",
        city: clientData.city ?? "",
        state: clientData.state ?? "",
        zipCode: clientData.zipCode ?? "",
        birthDate: clientData.birthDate ?? "",
        gender: clientData.gender ?? "",
        notes: clientData.notes ?? "",
      })
    } else if (!isEditing && open) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        type: "individual",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        birthDate: "",
        gender: "",
        notes: "",
      })
    }
  }, [isEditing, clientData, open, form])

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      if (isEditing && clientId) {
        await updateClient.mutateAsync({ id: clientId, data } as any)
      } else {
        await createClient.mutateAsync(data as any)
        // Optionally send a magic link after creation if admin requested and email is present
        if (sendMagicLink && data.email) {
          try {
            await clientService.generateMagicLink(data.email)
            toast({ title: "Link enviado", description: "Link de acesso enviado para o e-mail do cliente." })
          } catch (err: any) {
            toast({ title: "Falha ao enviar link", description: err?.response?.data?.message || "Não foi possível enviar o link de acesso.", variant: "destructive" })
          }
        }
      }
      form.reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      // handled by hooks
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={clientId || "new"}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        {isEditing && isLoadingClient ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Carregando dados do cliente...</p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
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
                        value={field.value ?? ""}
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
                        value={field.value ?? ""}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select {...field} className="rounded border px-3 py-2 text-sm w-full">
                        <option value="individual">Pessoa Física</option>
                        <option value="business">Pessoa Jurídica</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEditing && (
              <div className="flex items-center gap-2">
                <input
                  id="send-magic-link"
                  type="checkbox"
                  checked={sendMagicLink}
                  onChange={(e) => setSendMagicLink(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="send-magic-link" className="text-sm">
                  Enviar link de acesso por e-mail (magic link)
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
  </Dialog>
  )
}

