import { ProtectedRoute } from "@/components/auth/protected-route"
import { PositionList } from "@/components/positions/position-list"

export default function PositionsPage() {
  return (
    <ProtectedRoute requiredPermissions={["settings.view"]}>
      <div className="container mx-auto py-8">
        <PositionList />
      </div>
    </ProtectedRoute>
  )
}
