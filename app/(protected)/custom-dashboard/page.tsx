"use client"

import { useState } from "react"
import { Plus, RotateCcw, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useDashboardLayout, useSaveDashboardLayout, useResetDashboardLayout } from "@/hooks/use-dashboard"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsStatusChart } from "@/components/dashboard/appointments-status-chart"
import { TopServicesChart } from "@/components/dashboard/top-services-chart"
import { EmployeePerformanceChart } from "@/components/dashboard/employee-performance-chart"
import { ClientGrowthChart } from "@/components/dashboard/client-growth-chart"
import type { Widget, WidgetType } from "@/lib/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

const AVAILABLE_WIDGETS: Array<{ type: WidgetType; label: string; description: string }> = [
  { type: "revenue-chart", label: "Gráfico de Receita", description: "Evolução da receita ao longo do tempo" },
  { type: "appointments-status", label: "Status dos Agendamentos", description: "Distribuição por status" },
  { type: "top-services", label: "Serviços Mais Vendidos", description: "Top 5 serviços por receita" },
  { type: "employee-performance", label: "Performance dos Funcionários", description: "Top 5 funcionários" },
  { type: "client-growth", label: "Crescimento de Clientes", description: "Novos clientes ao longo do tempo" },
]

export default function CustomDashboardPage() {
  const { data: layout, isLoading } = useDashboardLayout()
  const saveMutation = useSaveDashboardLayout()
  const resetMutation = useResetDashboardLayout()
  const [widgets, setWidgets] = useState<Widget[]>(layout?.widgets || [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | "">("")

  const handleAddWidget = () => {
    if (!selectedWidgetType) return

    const widgetConfig = AVAILABLE_WIDGETS.find((w) => w.type === selectedWidgetType)
    if (!widgetConfig) return

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: selectedWidgetType,
      title: widgetConfig.label,
      size: "medium",
      position: widgets.length,
      visible: true,
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    saveMutation.mutate(updatedWidgets)
    setIsAddDialogOpen(false)
    setSelectedWidgetType("")
  }

  const handleToggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    setWidgets(updatedWidgets)
    saveMutation.mutate(updatedWidgets)
  }

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId)
    setWidgets(updatedWidgets)
    saveMutation.mutate(updatedWidgets)
  }

  const handleReset = () => {
    resetMutation.mutate()
  }

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null

    switch (widget.type) {
      case "revenue-chart":
        return <RevenueChart />
      case "appointments-status":
        return <AppointmentsStatusChart />
      case "top-services":
        return <TopServicesChart />
      case "employee-performance":
        return <EmployeePerformanceChart />
      case "client-growth":
        return <ClientGrowthChart />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Personalizado</h1>
          <p className="text-muted-foreground">Personalize sua dashboard com os widgets que você precisa</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Widget</DialogTitle>
                <DialogDescription>Escolha um widget para adicionar à sua dashboard</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Widget</Label>
                  <Select
                    value={selectedWidgetType}
                    onValueChange={(value) => setSelectedWidgetType(value as WidgetType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um widget" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_WIDGETS.map((widget) => (
                        <SelectItem key={widget.type} value={widget.type}>
                          <div>
                            <div className="font-medium">{widget.label}</div>
                            <div className="text-xs text-muted-foreground">{widget.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddWidget} disabled={!selectedWidgetType}>
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>
      </div>

      {/* Widget Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Widgets</CardTitle>
          <CardDescription>Ative ou desative os widgets que você deseja visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <div>
                    <div className="font-medium">{widget.title}</div>
                    <div className="text-xs text-muted-foreground">{widget.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={widget.visible} onCheckedChange={() => handleToggleWidget(widget.id)} />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveWidget(widget.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
            {widgets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum widget adicionado. Clique em "Adicionar Widget" para começar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {widgets
          .filter((w) => w.visible)
          .map((widget) => (
            <div key={widget.id}>{renderWidget(widget)}</div>
          ))}
      </div>
    </div>
  )
}
