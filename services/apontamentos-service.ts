import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME } from "@/app/lib/api-config"
import type { 
  ApontamentoQuinzenal,
  CriarApontamentoRequest,
  AtualizarApontamentoRequest,
  ReplicarApontamentosRequest,
  ReplicarApontamentosResponse,
  ApontamentosPaginatedResponse
} from "@/types/api-types"

/**
 * Serviço para gerenciar apontamentos conforme documentação oficial da API Pessoal
 */
export const apontamentosService = {
  /**
   * 1. Criar Apontamento
   * POST /apontamentos
   */
  async criarApontamento(apontamento: CriarApontamentoRequest): Promise<ApontamentoQuinzenal> {
    return apiClient.post<ApontamentoQuinzenal>("/apontamentos", apontamento)
  },

  /**
   * 2. Listar Apontamentos
   * GET /apontamentos
   */
  async listarApontamentos(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApontamentosPaginatedResponse> {
    // Constrói a query string a partir dos parâmetros
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiClient.get<ApontamentosPaginatedResponse>(`/apontamentos${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["apontamentos"],
      },
    })
  },

  /**
   * 3. Atualizar Apontamento
   * PUT /funcionarios/apontamentos/{apontamentoId}
   */
  async atualizarApontamento(apontamentoId: string, apontamento: AtualizarApontamentoRequest): Promise<ApontamentoQuinzenal> {
    return apiClient.put<ApontamentoQuinzenal>(`/funcionarios/apontamentos/${apontamentoId}`, apontamento)
  },

  /**
   * 4. Aprovar Apontamento
   * PATCH /apontamentos/{apontamentoId}/aprovar
   */
  async aprovarApontamento(apontamentoId: string): Promise<ApontamentoQuinzenal> {
    return apiClient.patch<ApontamentoQuinzenal>(`/apontamentos/${apontamentoId}/aprovar`)
  },

  /**
   * 5. Cancelar Aprovação do Apontamento
   * PATCH /apontamentos/{apontamentoId}/cancelar-aprovacao
   */
  async cancelarApontamento(apontamentoId: string): Promise<ApontamentoQuinzenal> {
    return apiClient.patch<ApontamentoQuinzenal>(`/apontamentos/${apontamentoId}/cancelar-aprovacao`)
  },

  /**
   * 6. Replicar Apontamentos para Próxima Quinzena
   * POST /funcionarios/apontamentos/replicar
   */
  async replicarApontamentos(request: ReplicarApontamentosRequest): Promise<ReplicarApontamentosResponse> {
    return apiClient.post<ReplicarApontamentosResponse>("/funcionarios/apontamentos/replicar", request)
  },

  /**
   * Buscar apontamento por ID (método auxiliar não documentado mas útil)
   */
  async obterApontamento(apontamentoId: string): Promise<ApontamentoQuinzenal> {
    return apiClient.get<ApontamentoQuinzenal>(`/apontamentos/${apontamentoId}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`apontamento-${apontamentoId}`],
      },
    })
  },
}