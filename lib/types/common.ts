// API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API error response
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, unknown>
}

// Filter and sort options
export interface ListFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  [key: string]: unknown
}
