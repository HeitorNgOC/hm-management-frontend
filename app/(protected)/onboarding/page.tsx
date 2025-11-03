"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CompanyInfoForm } from "@/components/onboarding/company-info-form"
import { OperatingHoursForm } from "@/components/onboarding/operating-hours-form"
import { ServiceCategoriesForm } from "@/components/onboarding/service-categories-form"
import { PaymentMethodsForm } from "@/components/onboarding/payment-methods-form"
import { useOnboarding } from "@/hooks/use-onboarding"
import type { CompanyInfoData, OperatingHours, ServiceCategory, PaymentMethod } from "@/lib/types/company"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

const steps = [
  { id: 1, title: "Informações da Empresa", description: "Dados básicos e endereço" },
  { id: 2, title: "Horários de Funcionamento", description: "Configure quando você atende" },
  { id: 3, title: "Categorias de Serviço", description: "Organize seus serviços" },
  { id: 4, title: "Métodos de Pagamento", description: "Como você recebe pagamentos" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    companyInfo: null as CompanyInfoData | null,
    operatingHours: null as OperatingHours[] | null,
    serviceCategories: null as ServiceCategory[] | null,
    paymentMethods: null as PaymentMethod[] | null,
  })

  const { updateCompanyInfo, updateOperatingHours, updateServiceCategories, updatePaymentMethods, completeOnboarding } =
    useOnboarding()

  const progress = (currentStep / steps.length) * 100

  const handleCompanyInfoSubmit = async (data: CompanyInfoData) => {
    try {
      await updateCompanyInfo.mutateAsync(data)
      setOnboardingData({ ...onboardingData, companyInfo: data })
      setCurrentStep(2)
    } catch (error) {
      console.error("[v0] Error saving company info:", error)
    }
  }

  const handleOperatingHoursSubmit = async (data: OperatingHours[]) => {
    try {
      await updateOperatingHours.mutateAsync(data)
      setOnboardingData({ ...onboardingData, operatingHours: data })
      setCurrentStep(3)
    } catch (error) {
      console.error("[v0] Error saving operating hours:", error)
    }
  }

  const handleServiceCategoriesSubmit = async (data: ServiceCategory[]) => {
    try {
      await updateServiceCategories.mutateAsync(data)
      setOnboardingData({ ...onboardingData, serviceCategories: data })
      setCurrentStep(4)
    } catch (error) {
      console.error("[v0] Error saving service categories:", error)
    }
  }

  const handlePaymentMethodsSubmit = async (data: PaymentMethod[]) => {
    try {
      await updatePaymentMethods.mutateAsync(data)
      setOnboardingData({ ...onboardingData, paymentMethods: data })
      await completeOnboarding.mutateAsync()
      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Error completing onboarding:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Bem-vindo ao HM Management</h1>
          <p className="mt-2 text-muted-foreground">Vamos configurar sua empresa em alguns passos simples</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">
              Passo {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-lg border p-4 ${
                step.id === currentStep
                  ? "border-primary bg-primary/5"
                  : step.id < currentStep
                    ? "border-green-500 bg-green-50"
                    : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                {step.id < currentStep ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                      step.id === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div>
          {currentStep === 1 && (
            <CompanyInfoForm
              onSubmit={handleCompanyInfoSubmit}
              defaultValues={onboardingData.companyInfo || undefined}
              isLoading={updateCompanyInfo.isPending}
            />
          )}

          {currentStep === 2 && (
            <OperatingHoursForm
              onSubmit={handleOperatingHoursSubmit}
              onBack={() => setCurrentStep(1)}
              defaultValues={onboardingData.operatingHours || undefined}
              isLoading={updateOperatingHours.isPending}
            />
          )}

          {currentStep === 3 && (
            <ServiceCategoriesForm
              onSubmit={handleServiceCategoriesSubmit}
              onBack={() => setCurrentStep(2)}
              defaultValues={onboardingData.serviceCategories || undefined}
              isLoading={updateServiceCategories.isPending}
            />
          )}

          {currentStep === 4 && (
            <PaymentMethodsForm
              onSubmit={handlePaymentMethodsSubmit}
              onBack={() => setCurrentStep(3)}
              defaultValues={onboardingData.paymentMethods || undefined}
              isLoading={updatePaymentMethods.isPending || completeOnboarding.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}
