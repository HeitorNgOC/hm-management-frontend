import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserList } from "@/components/users/user-list"

export default function UsersPage() {
  return (
    <ProtectedRoute requiredPermissions={["users.view"]}>
      <div className="container mx-auto py-8">
        <UserList />
      </div>
    </ProtectedRoute>
  )
}
