/**
 * Configuração base para a API
 */

// URL base da API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Tempo padrão de cache (em segundos)
export const DEFAULT_CACHE_TIME = 60 // 1 minuto

// Tempo de cache para dados que mudam com menos frequência
export const LONG_CACHE_TIME = 3600 // 1 hora

// Headers padrão para requisições
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
}

// Timeout para requisições (em milissegundos)
export const REQUEST_TIMEOUT = 10000 // 10 segundos

// Configurações de revalidação
export type RevalidateOptions = {
  revalidate?: number | false
  tags?: string[]
}

// Opções para requisições
export type RequestOptions = {
  headers?: Record<string, string>
  cache?: RequestCache
  next?: RevalidateOptions
  skipAuth?: boolean // Flag para pular autenticação
}
