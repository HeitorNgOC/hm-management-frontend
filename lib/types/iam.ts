import type { UserRole } from "./user"

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked"

export interface Invitation {
  id: string
  companyId: string
  email: string
  name?: string
  role?: UserRole
  positionId?: string
  token: string
  status: InvitationStatus
  expiresAt: string
  acceptedAt?: string
  createdAt: string
  createdBy?: {
    id: string
    name: string
  }
}

export interface CreateInvitationRequest {
  email: string
  name?: string
  role?: UserRole
  positionId?: string
}

export interface InvitationFilters {
  search?: string
  status?: InvitationStatus
}

export interface AcceptInviteRequest {
  inviteToken: string
  name?: string
  password: string
}
