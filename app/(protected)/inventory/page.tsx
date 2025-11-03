import { ProtectedRoute } from "@/components/auth/protected-route"
import { InventoryList } from "@/components/inventory/inventory-list"

export default function InventoryPage() {
  return (
    <ProtectedRoute requiredPermissions={["inventory.view"]}>
      <div className="container mx-auto py-8">
        <InventoryList />
      </div>
    </ProtectedRoute>
  )
}
