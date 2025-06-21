import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME, LONG_CACHE_TIME } from "@/app/lib/api-config"
import type { Fornecedor, Orcamento, FilterOptions, PaginatedResponse } from "@/types/api-types"

/**
 * Serviço para gerenciar fornecedores
 */
export const fornecedoresService = {
  /**
   * Busca todos os fornecedores com paginação e filtros
   */
  async listarFornecedores(filtros?: FilterOptions): Promise<PaginatedResponse<Fornecedor>> {
    // Constrói a query string a partir dos filtros
    const queryParams = new URLSearchParams()
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiClient.get<PaginatedResponse<Fornecedor>>(`/fornecedores${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["fornecedores"],
      },
    })
  },

  /**
   * Busca um fornecedor pelo ID
   */
  async obterFornecedor(id: string): Promise<Fornecedor> {
    return apiClient.get<Fornecedor>(`/fornecedores/${id}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`fornecedor-${id}`],
      },
    })
  },

  /**
   * Cria um novo fornecedor
   */
  async criarFornecedor(fornecedor: Omit<Fornecedor, "id">): Promise<Fornecedor> {
    return apiClient.post<Fornecedor>("/fornecedores", fornecedor)
  },

  /**
   * Atualiza um fornecedor existente
   */
  async atualizarFornecedor(id: string, fornecedor: Partial<Fornecedor>): Promise<Fornecedor> {
    return apiClient.put<Fornecedor>(`/fornecedores/${id}`, fornecedor)
  },

  /**
   * Remove um fornecedor
   */
  async removerFornecedor(id: string): Promise<void> {
    return apiClient.delete<void>(`/fornecedores/${id}`)
  },

  /**
   * Busca os orçamentos de um fornecedor
   */
  async listarOrcamentos(fornecedorId: string, filtros?: FilterOptions): Promise<PaginatedResponse<Orcamento>> {
    // Constrói a query string a partir dos filtros
    const queryParams = new URLSearchParams()
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiClient.get<PaginatedResponse<Orcamento>>(`/fornecedores/${fornecedorId}/orcamentos${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`fornecedor-${fornecedorId}-orcamentos`],
      },
    })
  },

  /**
   * Avalia um fornecedor
   */
  async avaliarFornecedor(id: string, avaliacao: number): Promise<Fornecedor> {
    return apiClient.post<Fornecedor>(`/fornecedores/${id}/avaliar`, { avaliacao })
  },

  /**
   * Busca estatísticas de fornecedores
   */
  async obterEstatisticas(): Promise<{
    total: number
    ativos: number
    inativos: number
    avaliacaoMedia: number
    distribuicaoPorTipo: Array<{
      tipo: string
      quantidade: number
      porcentagem: number
    }>
  }> {
    return apiClient.get<any>("/fornecedores/estatisticas", {
      next: {
        revalidate: LONG_CACHE_TIME,
        tags: ["fornecedores-estatisticas"],
      },
    })
  },
}
