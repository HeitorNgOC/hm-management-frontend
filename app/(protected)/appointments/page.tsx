import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"

export default function AppointmentsPage() {
  return (
    <ProtectedRoute permissions={["appointments.view"]}>
      <div className="container mx-auto py-8">
        <AppointmentCalendar />
      </div>
    </ProtectedRoute>
  )
}
