import { apiClient } from "@/lib/api-client"
import type {
  CashRegister,
  Transaction,
  FinancialSummary,
  CreateCashRegisterRequest,
  CloseCashRegisterRequest,
  CreateTransactionRequest,
  TransactionFilters,
} from "@/lib/types/financial"
import type { PaginatedResponse } from "@/lib/types/common"

const financialService = {
  // Cash Register
  getCurrentCashRegister: async (): Promise<CashRegister> => {
    const response = await apiClient.get<CashRegister>("/cash-register/current")
    return response.data
  },

  getCashRegisters: async (page = 1, limit = 20): Promise<PaginatedResponse<CashRegister>> => {
    const response = await apiClient.get<PaginatedResponse<CashRegister>>(`/cash-register?page=${page}&limit=${limit}`)
    return response.data
  },

  openCashRegister: async (data: CreateCashRegisterRequest): Promise<CashRegister> => {
    const response = await apiClient.post<CashRegister>("/cash-register/open", data)
    return response.data
  },

  closeCashRegister: async (id: string, data: CloseCashRegisterRequest): Promise<CashRegister> => {
    const response = await apiClient.post<CashRegister>(`/cash-register/${id}/close`, data)
    return response.data
  },

  // Transactions
  getTransactions: async (filters?: TransactionFilters, page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.cashRegisterId && { cashRegisterId: filters.cashRegisterId }),
    })

    const response = await apiClient.get<PaginatedResponse<Transaction>>(`/transactions?${params.toString()}`)
    return response.data
  },

  createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>("/transactions", data)
    return response.data
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const response = await apiClient.delete<void>(`/transactions/${id}`)
    return response.data
  },

  // Summary
  getFinancialSummary: async (startDate: string, endDate: string): Promise<FinancialSummary> => {
    const response = await apiClient.get<FinancialSummary>(`/financial/summary?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },
}

export { financialService }
