export interface Reservation {
  id: string
  companyId: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  reservationDate: string
  reservationTime: string
  partySize: number
  notes?: string
  status: ReservationStatus
  tableId?: string
  table?: Table
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  number: string
  capacity: number
}

export type ReservationStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no_show"

export interface CreateReservationRequest {
  customerName: string
  customerEmail?: string
  customerPhone: string
  reservationDate: string
  reservationTime: string
  partySize: number
  notes?: string
}

export interface UpdateReservationRequest {
  customerName?: string
  customerPhone?: string
  reservationDate?: string
  reservationTime?: string
  partySize?: number
  status?: ReservationStatus
  tableId?: string
  notes?: string
}

export interface ReservationFilters {
  status?: ReservationStatus
  date?: string
  partySize?: number
}
