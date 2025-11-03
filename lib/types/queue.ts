// Queue/Reception module types for clinics

export interface QueueTicket {
  id: string
  companyId: string
  ticketNumber: string
  clientId: string
  client?: {
    id: string
    name: string
    phone: string
    avatar?: string
  }
  serviceType: string
  priority: QueuePriority
  status: QueueStatus
  checkInTime: string
  calledTime?: string
  startServiceTime?: string
  endServiceTime?: string
  attendantId?: string
  attendant?: {
    id: string
    name: string
  }
  deskNumber?: string
  notes?: string
  estimatedWaitTime?: number // in minutes
  createdAt: string
  updatedAt: string
}

export type QueuePriority = "normal" | "priority" | "urgent"
export type QueueStatus = "waiting" | "called" | "in_service" | "completed" | "cancelled" | "no_show"

export interface QueueDesk {
  id: string
  companyId: string
  deskNumber: string
  name: string
  serviceTypes: string[]
  attendantId?: string
  attendant?: {
    id: string
    name: string
  }
  status: DeskStatus
  currentTicketId?: string
  currentTicket?: QueueTicket
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type DeskStatus = "available" | "busy" | "paused" | "offline"

export interface QueueSettings {
  id: string
  companyId: string
  autoCallNext: boolean
  estimatedServiceTime: number // in minutes
  maxWaitingTickets: number
  priorityMultiplier: number
  serviceTypes: string[]
  workingHours: WorkingHours
  createdAt: string
  updatedAt: string
}

export interface WorkingHours {
  monday?: TimeRange
  tuesday?: TimeRange
  wednesday?: TimeRange
  thursday?: TimeRange
  friday?: TimeRange
  saturday?: TimeRange
  sunday?: TimeRange
}

export interface TimeRange {
  start: string // HH:mm
  end: string // HH:mm
}

export interface CreateTicketRequest {
  clientId: string
  serviceType: string
  priority?: QueuePriority
  notes?: string
}

export interface UpdateTicketRequest {
  status?: QueueStatus
  attendantId?: string
  deskNumber?: string
  notes?: string
}

export interface CreateDeskRequest {
  deskNumber: string
  name: string
  serviceTypes: string[]
  attendantId?: string
}

export interface UpdateDeskRequest {
  deskNumber?: string
  name?: string
  serviceTypes?: string[]
  attendantId?: string
  status?: DeskStatus
  isActive?: boolean
}

export interface CallNextRequest {
  deskId: string
  serviceType?: string
}

export interface QueueTicketFilters {
  status?: QueueStatus
  priority?: QueuePriority
  serviceType?: string
  date?: string
}

export interface QueueDeskFilters {
  status?: DeskStatus
  isActive?: boolean
}

export interface QueueStats {
  totalWaiting: number
  totalInService: number
  totalCompleted: number
  averageWaitTime: number
  averageServiceTime: number
  ticketsByPriority: {
    normal: number
    priority: number
    urgent: number
  }
  ticketsByStatus: {
    waiting: number
    called: number
    in_service: number
    completed: number
    cancelled: number
    no_show: number
  }
}
