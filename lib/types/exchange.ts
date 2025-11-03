export interface Exchange {
  id: string
  companyId: string
  exchangeNumber: string
  customerId?: string
  customerName: string
  originalItemId: string
  originalItem: {
    id: string
    name: string
    sku: string
    sellPrice: number
  }
  originalQuantity: number
  originalTotalValue: number
  newItemId: string
  newItem: {
    id: string
    name: string
    sku: string
    sellPrice: number
  }
  newQuantity: number
  newTotalValue: number
  priceDifference: number
  status: ExchangeStatus
  reason?: string
  notes?: string
  transactionId?: string
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancelledAt?: string
}

export type ExchangeStatus = "pending" | "completed" | "cancelled"

export interface CreateExchangeRequest {
  customerName: string
  customerId?: string
  originalItemId: string
  originalQuantity: number
  newItemId: string
  newQuantity: number
  reason?: string
  notes?: string
}

export interface UpdateExchangeRequest {
  status?: ExchangeStatus
  notes?: string
}

export interface ExchangeFilters {
  search?: string
  status?: ExchangeStatus
  customerId?: string
  startDate?: string
  endDate?: string
}

export interface ExchangeStats {
  totalExchanges: number
  pendingExchanges: number
  completedExchanges: number
  cancelledExchanges: number
  totalValueDifference: number
  period: {
    start: string
    end: string
  }
}
