import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Query keys factory for consistent cache management
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    permissions: ["auth", "permissions"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  companies: {
    current: ["companies", "current"] as const,
    settings: ["companies", "settings"] as const,
  },
  positions: {
    all: ["positions"] as const,
    list: (filters?: Record<string, unknown>) => ["positions", "list", filters] as const,
    detail: (id: string) => ["positions", "detail", id] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (filters?: Record<string, unknown>) => ["appointments", "list", filters] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
    calendar: (date: string) => ["appointments", "calendar", date] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (filters?: Record<string, unknown>) => ["inventory", "list", filters] as const,
    detail: (id: string) => ["inventory", "detail", id] as const,
    lowStock: ["inventory", "low-stock"] as const,
  },
  restaurant: {
    tables: {
      all: ["restaurant", "tables"] as const,
      detail: (id: string) => ["restaurant", "tables", id] as const,
    },
    orders: {
      all: ["restaurant", "orders"] as const,
      list: (filters?: Record<string, unknown>) => ["restaurant", "orders", "list", filters] as const,
      detail: (id: string) => ["restaurant", "orders", "detail", id] as const,
    },
  },
  payments: {
    subscriptions: ["payments", "subscriptions"] as const,
    invoices: (filters?: Record<string, unknown>) => ["payments", "invoices", filters] as const,
  },
  financial: {
    cashRegister: {
      current: ["financial", "cash-register", "current"] as const,
      history: (filters?: Record<string, unknown>) => ["financial", "cash-register", "history", filters] as const,
    },
    transactions: (filters?: Record<string, unknown>) => ["financial", "transactions", filters] as const,
  },
  reports: {
    sales: (filters?: Record<string, unknown>) => ["reports", "sales", filters] as const,
    inventory: (filters?: Record<string, unknown>) => ["reports", "inventory", filters] as const,
    financial: (filters?: Record<string, unknown>) => ["reports", "financial", filters] as const,
  },
}
