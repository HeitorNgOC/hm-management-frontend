import { Badge } from "@/components/ui/badge"
import type { UserStatus } from "@/lib/types/user"

interface UserStatusBadgeProps {
  status: UserStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const variants = {
    active: { label: "Ativo", variant: "default" as const },
    inactive: { label: "Inativo", variant: "secondary" as const },
    on_leave: { label: "De Férias", variant: "outline" as const },
  }

  const { label, variant } = variants[status]

  return <Badge variant={variant}>{label}</Badge>
}
