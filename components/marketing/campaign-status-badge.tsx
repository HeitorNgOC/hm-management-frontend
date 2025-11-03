import { Badge } from "@/components/ui/badge"
import type { Campaign } from "@/lib/types/marketing"

interface CampaignStatusBadgeProps {
  status: Campaign["status"]
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const variants: Record<Campaign["status"], "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    scheduled: "secondary",
    sent: "default",
    paused: "destructive",
    cancelled: "destructive",
  }

  const labels: Record<Campaign["status"], string> = {
    draft: "Rascunho",
    scheduled: "Agendada",
    sent: "Enviada",
    paused: "Pausada",
    cancelled: "Cancelada",
  }

  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}
