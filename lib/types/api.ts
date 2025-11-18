/**
 * Resposta padrão da API
 * Todas as respostas seguem este formato
 */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: ApiError | null
}

/**
 * Estrutura de erro da API
 */
export interface ApiError {
  code: string
  message: string
}