export interface CashRegister {
  id: string
  companyId: string
  userId: string
  user: {
    id: string
    name: string
  }
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  difference?: number
  status: CashRegisterStatus
  openedAt: string
  closedAt?: string
  notes?: string
}

export type CashRegisterStatus = "open" | "closed"

export interface Transaction {
  id: string
  companyId: string
  cashRegisterId?: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  paymentMethod: string
  description?: string
  referenceId?: string
  referenceType?: string
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
}

export type TransactionType = "income" | "expense"
export type TransactionCategory =
  | "service"
  | "product"
  | "salary"
  | "rent"
  | "utilities"
  | "supplies"
  | "maintenance"
  | "other"

export interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  period: {
    start: string
    end: string
  }
  incomeByCategory: Record<string, number>
  expenseByCategory: Record<string, number>
  incomeByPaymentMethod: Record<string, number>
}

export interface CreateCashRegisterRequest {
  openingBalance: number
  notes?: string
}

export interface CloseCashRegisterRequest {
  closingBalance: number
  notes?: string
}

export interface CreateTransactionRequest {
  cashRegisterId?: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  paymentMethod: string
  description?: string
  referenceId?: string
  referenceType?: string
}

export interface TransactionFilters {
  type?: TransactionType
  category?: TransactionCategory
  paymentMethod?: string
  startDate?: string
  endDate?: string
  cashRegisterId?: string
}
