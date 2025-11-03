import { Badge } from "@/components/ui/badge"
import type { AppointmentStatus } from "@/lib/types/appointment"

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const variants = {
    scheduled: { label: "Agendado", variant: "secondary" as const },
    confirmed: { label: "Confirmado", variant: "default" as const },
    in_progress: { label: "Em Andamento", variant: "default" as const },
    completed: { label: "Concluído", variant: "outline" as const },
    cancelled: { label: "Cancelado", variant: "destructive" as const },
    no_show: { label: "Não Compareceu", variant: "destructive" as const },
  }

  const { label, variant } = variants[status]

  return <Badge variant={variant}>{label}</Badge>
}
