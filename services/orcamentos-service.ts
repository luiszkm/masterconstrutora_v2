import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME } from "@/app/lib/api-config"
import type { Orcamento, FilterOptions, BackendPaginatedResponse } from "@/types/api-types"

/**
 * Serviço para gerenciar orçamentos
 */
export const orcamentosService = {
  /**
   * Busca todos os orçamentos com paginação e filtros
   */
  async listarOrcamentos(filtros?: FilterOptions): Promise<BackendPaginatedResponse<Orcamento>> {
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

    return apiClient.get<BackendPaginatedResponse<Orcamento>>(`/orcamentos${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["orcamentos"],
      },
    })
  },

  /**
   * Busca um orçamento pelo ID
   */
  async obterOrcamento(id: string): Promise<Orcamento> {
    return apiClient.get<Orcamento>(`/orcamentos/${id}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`orcamento-${id}`],
      },
    })
  },

  /**
   * Cria um novo orçamento
   */
  async criarOrcamento(orcamento: Omit<Orcamento, "id">): Promise<Orcamento> {
    return apiClient.post<Orcamento>("/orcamentos", orcamento)
  },

  /**
   * Atualiza um orçamento existente
   */
  async atualizarOrcamento(id: string, orcamento: Partial<Orcamento>): Promise<Orcamento> {
    return apiClient.put<Orcamento>(`/orcamentos/${id}`, orcamento)
  },

  /**
   * Remove um orçamento
   */
  async removerOrcamento(id: string): Promise<void> {
    return apiClient.delete<void>(`/orcamentos/${id}`)
  },

  /**
   * Aprova um orçamento
   */
  async aprovarOrcamento(id: string, aprovadoPor: string): Promise<Orcamento> {
    return apiClient.post<Orcamento>(`/orcamentos/${id}/aprovar`, { aprovadoPor })
  },

  /**
   * Rejeita um orçamento
   */
  async rejeitarOrcamento(id: string, motivo: string): Promise<Orcamento> {
    return apiClient.post<Orcamento>(`/orcamentos/${id}/rejeitar`, { motivo })
  },

  /**
   * Registra o pagamento de um orçamento
   */
  async registrarPagamento(
    id: string,
    dados: {
      dataPagamento: string
      comprovantePagamento?: string
    },
  ): Promise<Orcamento> {
    return apiClient.post<Orcamento>(`/orcamentos/${id}/pagar`, dados)
  },

  /**
   * Registra o pagamento de múltiplos orçamentos
   */
  async registrarPagamentosEmMassa(
    ids: string[],
    dados: {
      dataPagamento: string
      comprovantePagamento?: string
    },
  ): Promise<Orcamento[]> {
    return apiClient.post<Orcamento[]>("/orcamentos/pagar-em-massa", {
      ids,
      ...dados,
    })
  },

  /**
   * Compara orçamentos
   */
  async compararOrcamentos(ids: string[]): Promise<{
    orcamentos: Orcamento[]
    comparacao: {
      melhorPreco: string
      diferencaPercentual: number
      economiaTotal: number
      itensComparados: Array<{
        descricao: string
        precos: Record<string, number>
        melhorPreco: string
        diferencaPercentual: number
      }>
    }
  }> {
    // Constrói a query string com os IDs
    const queryParams = new URLSearchParams()
    ids.forEach((id) => queryParams.append("ids", id))

    return apiClient.get<any>(`/orcamentos/comparar?${queryParams.toString()}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["orcamentos-comparacao"],
      },
    })
  },
}
