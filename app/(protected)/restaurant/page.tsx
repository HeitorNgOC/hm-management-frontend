"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { LayoutGrid, UtensilsCrossed, ChefHat, Calendar, CreditCard } from "lucide-react"

// Tab components will be created below
import RestaurantMesas from "@/components/restaurant/restaurant-mesas"
import RestaurantPedidos from "@/components/restaurant/restaurant-pedidos"
import RestaurantCozinha from "@/components/restaurant/restaurant-cozinha"
import RestaurantReservas from "@/components/restaurant/restaurant-reservas"
import RestaurantCaixa from "@/components/restaurant/restaurant-caixa"

export default function RestaurantPage() {
  const [activeTab, setActiveTab] = useState("mesas")

  return (
    <ProtectedRoute requiredPermissions={["appointments.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gerenciador de Restaurante</h1>
          <p className="text-muted-foreground">Gerencie mesas, pedidos, cozinha, reservas e caixa</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="mesas" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Mesas
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="cozinha" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Cozinha
            </TabsTrigger>
            <TabsTrigger value="reservas" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="caixa" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Caixa
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="mesas">
              <RestaurantMesas />
            </TabsContent>

            <TabsContent value="pedidos">
              <RestaurantPedidos />
            </TabsContent>

            <TabsContent value="cozinha">
              <RestaurantCozinha />
            </TabsContent>

            <TabsContent value="reservas">
              <RestaurantReservas />
            </TabsContent>

            <TabsContent value="caixa">
              <RestaurantCaixa />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
