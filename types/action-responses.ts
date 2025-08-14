/**
 * Tipos padronizados para respostas das Server Actions
 */

/**
 * Resposta padrão para operações de Server Actions
 */
export interface ActionResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * Resposta específica para operações de criação que retornam ID
 */
export interface CreateActionResponse<T = string> extends ActionResponse<T> {
  id?: T
}

/**
 * Resposta para operações de listagem/busca
 */
export interface ListActionResponse<T = any> extends ActionResponse<T[]> {
  items?: T[]
  total?: number
  page?: number
  limit?: number
}

/**
 * Resposta para operações de atualização
 */
export interface UpdateActionResponse<T = any> extends ActionResponse<T> {
  updatedData?: T
}

/**
 * Resposta para operações de deleção
 */
export interface DeleteActionResponse extends ActionResponse<null> {
  deletedId?: string
}

/**
 * Resposta para operações de login/autenticação
 */
export interface AuthActionResponse extends ActionResponse<{
  userId: string
  email: string
  token?: string
}> {
  redirectUrl?: string
}

/**
 * Resposta para operações que podem falhar com diferentes tipos de erro
 */
export interface ValidationActionResponse<T = any> extends ActionResponse<T> {
  validationErrors?: Record<string, string[]>
}

/**
 * Helper para criar respostas de sucesso padronizadas
 */
export function createSuccessResponse<T = any>(
  message: string,
  data?: T
): ActionResponse<T> {
  return {
    success: true,
    message,
    data
  }
}

/**
 * Helper para criar respostas de erro padronizadas
 */
export function createErrorResponse<T = any>(
  message: string,
  error?: string
): ActionResponse<T> {
  return {
    success: false,
    message,
    error
  }
}

/**
 * Helper para criar respostas de validação com erros
 */
export function createValidationErrorResponse(
  message: string,
  validationErrors: Record<string, string[]>
): ValidationActionResponse<null> {
  return {
    success: false,
    message,
    validationErrors,
    data: null
  }
}