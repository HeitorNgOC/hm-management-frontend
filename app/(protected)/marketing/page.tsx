"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignList } from "@/components/marketing/campaign-list"
import { TemplateList } from "@/components/marketing/template-list"
import { CouponList } from "@/components/marketing/coupon-list"

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("campaigns")

  return (
    <ProtectedRoute requiredPermissions={["marketing.view"]}>
      <div className="container mx-auto py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignList />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <TemplateList />
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <CouponList />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
