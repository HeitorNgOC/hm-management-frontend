"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { companyService } from "@/lib/services/company.service"
import type { CompanyInfoData, OperatingHours, ServiceCategory, PaymentMethod } from "@/lib/types/company"
import { useToast } from "@/hooks/use-toast"

export function useOnboarding() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateCompanyInfo = useMutation({
    mutationFn: (data: CompanyInfoData) => companyService.updateCompanyInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar informações",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateOperatingHours = useMutation({
    mutationFn: (hours: OperatingHours[]) => companyService.updateOperatingHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar horários",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateServiceCategories = useMutation({
    mutationFn: async (categories: ServiceCategory[]) => {
      // Create all categories
      const promises = categories.map((cat) =>
        companyService.createServiceCategory({
          name: cat.name,
          description: cat.description,
          isActive: cat.isActive,
          order: cat.order,
        }),
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "service-categories"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar categorias",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updatePaymentMethods = useMutation({
    mutationFn: (methods: PaymentMethod[]) => companyService.updatePaymentMethods(methods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "payment-methods"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar métodos de pagamento",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const completeOnboarding = useMutation({
    mutationFn: () => companyService.completeOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] })
      toast({
        title: "Onboarding concluído!",
        description: "Sua empresa está pronta para começar.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao concluir onboarding",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    updateCompanyInfo,
    updateOperatingHours,
    updateServiceCategories,
    updatePaymentMethods,
    completeOnboarding,
  }
}
