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
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common"

const financialService = {
  // Cash Register
  getCurrentCashRegister: async () => {
    const response = await apiClient.get<ApiResponse<CashRegister>>("/cash-register/current")
    return response.data
  },

  getCashRegisters: async (page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<CashRegister>>(`/cash-register?page=${page}&limit=${limit}`)
    return response.data
  },

  openCashRegister: async (data: CreateCashRegisterRequest) => {
    const response = await apiClient.post<ApiResponse<CashRegister>>("/cash-register/open", data)
    return response.data
  },

  closeCashRegister: async (id: string, data: CloseCashRegisterRequest) => {
    const response = await apiClient.post<ApiResponse<CashRegister>>(`/cash-register/${id}/close`, data)
    return response.data
  },

  // Transactions
  getTransactions: async (filters?: TransactionFilters, page = 1, limit = 20) => {
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

  createTransaction: async (data: CreateTransactionRequest) => {
    const response = await apiClient.post<ApiResponse<Transaction>>("/transactions", data)
    return response.data
  },

  deleteTransaction: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`)
    return response.data
  },

  // Summary
  getFinancialSummary: async (startDate: string, endDate: string) => {
    const response = await apiClient.get<ApiResponse<FinancialSummary>>(
      `/financial/summary?startDate=${startDate}&endDate=${endDate}`,
    )
    return response.data
  },
}

export { financialService }
