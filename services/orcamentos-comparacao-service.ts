/**
 * Serviço para comparação de orçamentos
 */

import { ComparacaoOrcamentosResponse } from "@/types/api-types"
import { API_BASE_URL, DEFAULT_HEADERS, type RequestOptions } from "@/app/lib/api-config"

class OrcamentosComparacaoService {
  private baseUrl = `${API_BASE_URL}`

  private async request<T>(
    endpoint: string, 
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, next, ...fetchOptions } = options
    
    const headers = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    }

    // Adicionar token de autenticação se não foi pulado
    if (!skipAuth) {
      // Aqui você pode adicionar a lógica de autenticação
      // Por exemplo: headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
      next,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Compara orçamentos por categoria
   */
  async compararPorCategoria(categoria: string): Promise<ComparacaoOrcamentosResponse> {
    return this.request<ComparacaoOrcamentosResponse>(
      `/orcamentos/comparar?categoria=${encodeURIComponent(categoria)}`
    )
  }

  /**
   * Obtém categorias disponíveis para comparação
   */
  async obterCategorias(): Promise<string[]> {
    return this.request<string[]>(`/orcamentos/categorias`)
  }
}

export const orcamentosComparacaoService = new OrcamentosComparacaoService()