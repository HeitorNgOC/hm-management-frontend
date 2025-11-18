"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceCategorySchema, type ServiceCategoryFormData } from "@/lib/validations/company"
import type { ServiceCategory } from "@/lib/types/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface ServiceCategoriesFormProps {
  onSubmit: (data: ServiceCategory[]) => void
  onBack: () => void
  defaultValues?: ServiceCategory[]
  isLoading?: boolean
}

export function ServiceCategoriesForm({ onSubmit, onBack, defaultValues, isLoading }: ServiceCategoriesFormProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>(
    defaultValues || [
      { id: "1", name: "Corte de Cabelo", description: "", isActive: true, order: 0 },
      { id: "2", name: "Barba", description: "", isActive: true, order: 1 },
    ],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceCategoryFormData>({
    resolver: zodResolver(serviceCategorySchema) as Resolver<ServiceCategoryFormData>,
    defaultValues: { name: "", description: "", isActive: true, order: 0 },
  })

  const handleAddCategory = (data: ServiceCategoryFormData) => {
    const newCategory: ServiceCategory = {
      id: Date.now().toString(),
      ...data,
      order: categories.length,
    }
    setCategories([...categories, newCategory])
    reset()
  }

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  const handleFormSubmit = () => {
    if (categories.length === 0) {
      return
    }
    onSubmit(categories)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Serviço</CardTitle>
          <CardDescription>Adicione as categorias de serviços que sua empresa oferece</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(handleAddCategory)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Corte de Cabelo" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descreva os serviços desta categoria"
                rows={3}
              />
            </div>

            <Button type="submit" variant="outline" className="w-full bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
          </form>

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categorias Adicionadas ({categories.length})</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 rounded-lg border p-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma categoria adicionada ainda</p>
              <p className="text-sm text-muted-foreground">Adicione pelo menos uma categoria para continuar</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleFormSubmit} disabled={isLoading || categories.length === 0}>
          {isLoading ? "Salvando..." : "Próximo"}
        </Button>
      </div>
    </div>
  )
}
