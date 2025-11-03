"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companyInfoSchema, type CompanyInfoFormData } from "@/lib/validations/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CompanyInfoFormProps {
  onSubmit: (data: CompanyInfoFormData) => void
  defaultValues?: Partial<CompanyInfoFormData>
  isLoading?: boolean
}

export function CompanyInfoForm({ onSubmit, defaultValues, isLoading }: CompanyInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Preencha os dados básicos da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input id="name" {...register("name")} placeholder="Minha Empresa Ltda" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input id="cnpj" {...register("cnpj")} placeholder="00.000.000/0000-00" />
              {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="contato@empresa.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>Informe o endereço da empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address.zipCode">CEP *</Label>
            <Input id="address.zipCode" {...register("address.zipCode")} placeholder="00000-000" />
            {errors.address?.zipCode && <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address.street">Rua *</Label>
              <Input id="address.street" {...register("address.street")} placeholder="Rua Principal" />
              {errors.address?.street && <p className="text-sm text-destructive">{errors.address.street.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.number">Número *</Label>
              <Input id="address.number" {...register("address.number")} placeholder="123" />
              {errors.address?.number && <p className="text-sm text-destructive">{errors.address.number.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.complement">Complemento</Label>
            <Input id="address.complement" {...register("address.complement")} placeholder="Sala 101" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="address.neighborhood">Bairro *</Label>
              <Input id="address.neighborhood" {...register("address.neighborhood")} placeholder="Centro" />
              {errors.address?.neighborhood && (
                <p className="text-sm text-destructive">{errors.address.neighborhood.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.city">Cidade *</Label>
              <Input id="address.city" {...register("address.city")} placeholder="São Paulo" />
              {errors.address?.city && <p className="text-sm text-destructive">{errors.address.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.state">Estado *</Label>
              <Input id="address.state" {...register("address.state")} placeholder="SP" maxLength={2} />
              {errors.address?.state && <p className="text-sm text-destructive">{errors.address.state.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Próximo"}
        </Button>
      </div>
    </form>
  )
}
