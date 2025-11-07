import { Badge } from "@/components/ui/badge"
import type { UserStatus } from "@/lib/types/user"

interface UserStatusBadgeProps {
  status?: UserStatus | string | null
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    active: { label: "Ativo", variant: "default" },
    inactive: { label: "Inativo", variant: "secondary" },
    on_leave: { label: "De Férias", variant: "outline" },
  }

  const mapped = variants[(status ?? "").toString()] ?? { label: "Desconhecido", variant: "outline" }

  return <Badge variant={mapped.variant}>{mapped.label}</Badge>
}
