import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserList } from "@/components/users/user-list"

export default function EmployeesPage() {
  return (
    <ProtectedRoute requiredPermissions={["users.view"]}>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os funcionários e suas informações</p>
        </div>
        <UserList />
      </div>
    </ProtectedRoute>
  )
}
