import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME } from "@/app/lib/api-config"
import type { 
  Funcionario, 
  CriarFuncionarioRequest, 
  AtualizarFuncionarioRequest,
  FuncionarioComUltimoApontamento,
  ApontamentoQuinzenal,
  ApontamentosPaginatedResponse
} from "@/types/api-types"

/**
 * Serviço para gerenciar funcionários conforme documentação oficial da API Pessoal
 */
export const funcionariosService = {
  /**
   * 1. Cadastrar Funcionário
   * POST /funcionarios
   */
  async criarFuncionario(funcionario: CriarFuncionarioRequest): Promise<Funcionario> {
    return apiClient.post<Funcionario>("/funcionarios", funcionario)
  },

  /**
   * 2. Listar Funcionários
   * GET /funcionarios
   */
  async listarFuncionarios(): Promise<Funcionario[]> {
    return apiClient.get<Funcionario[]>("/funcionarios", {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["funcionarios"],
      },
    })
  },

  /**
   * 3. Buscar Funcionário por ID
   * GET /funcionarios/{funcionarioId}
   */
  async obterFuncionario(funcionarioId: string): Promise<Funcionario> {
    return apiClient.get<Funcionario>(`/funcionarios/${funcionarioId}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`funcionario-${funcionarioId}`],
      },
    })
  },

  /**
   * 4. Atualizar Funcionário
   * PUT /funcionarios/{funcionarioId}
   */
  async atualizarFuncionario(funcionarioId: string, funcionario: AtualizarFuncionarioRequest): Promise<Funcionario> {
    return apiClient.put<Funcionario>(`/funcionarios/${funcionarioId}`, funcionario)
  },

  /**
   * 5. Ativar Funcionário
   * PATCH /funcionarios/{funcionarioId}/ativar
   */
  async ativarFuncionario(funcionarioId: string): Promise<void> {
    return apiClient.patch<void>(`/funcionarios/${funcionarioId}/ativar`)
  },

  /**
   * 6. Deletar Funcionário
   * DELETE /funcionarios/{funcionarioId}
   */
  async removerFuncionario(funcionarioId: string): Promise<void> {
    return apiClient.delete<void>(`/funcionarios/${funcionarioId}`)
  },

  /**
   * 7. Listar Funcionários com Último Apontamento
   * GET /funcionarios/apontamentos
   */
  async listarFuncionariosComUltimoApontamento(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<FuncionarioComUltimoApontamento[]> {
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

    return apiClient.get<FuncionarioComUltimoApontamento[]>(`/funcionarios/apontamentos${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["funcionarios-apontamentos"],
      },
    })
  },

  /**
   * 8. Listar Apontamentos por Funcionário
   * GET /funcionarios/{funcionarioId}/apontamentos
   */
  async listarApontamentosPorFuncionario(
    funcionarioId: string,
    params?: {
      page?: number
      pageSize?: number
      status?: string
    }
  ): Promise<ApontamentosPaginatedResponse> {
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

    return apiClient.get<ApontamentosPaginatedResponse>(`/funcionarios/${funcionarioId}/apontamentos${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`funcionario-${funcionarioId}-apontamentos`],
      },
    })
  },
}