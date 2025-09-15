import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME } from "@/app/lib/api-config"
import type { 
  Funcionario, 
  CriarFuncionarioRequest, 
  AtualizarFuncionarioRequest,
  FuncionarioComUltimoApontamento,
  ApontamentoQuinzenal,
  ApontamentosPaginatedResponse,
  BackendPaginatedResponse,
  FilterOptions
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
  async listarFuncionarios(filtros?: FilterOptions): Promise<BackendPaginatedResponse<Funcionario>> {
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

    return apiClient.get<BackendPaginatedResponse<Funcionario>>(`/funcionarios${query}`, {
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
    dataInicio?: string
    dataFim?: string
  }): Promise<BackendPaginatedResponse<FuncionarioComUltimoApontamento>> {
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

    try {
      const result = await apiClient.get<BackendPaginatedResponse<FuncionarioComUltimoApontamento>>(`/funcionarios/apontamentos${query}`, {
        next: {
          revalidate: DEFAULT_CACHE_TIME,
          tags: ["funcionarios-apontamentos"],
        },
      })

      // Ensure result has proper structure
      if (!result || typeof result !== 'object') {
        console.error('Invalid response from /funcionarios/apontamentos:', result)
        return {
          dados: [],
          paginacao: {
            totalItens: 0,
            totalPages: 1,
            currentPage: 1,
            pageSize: 20
          }
        }
      }

      // If result is an array, wrap it in the expected structure
      if (Array.isArray(result)) {
        return {
          dados: result,
          paginacao: {
            totalItens: result.length,
            totalPages: 1,
            currentPage: 1,
            pageSize: result.length || 20
          }
        }
      }

      // If result has dados property, return as is
      if (result.dados && Array.isArray(result.dados)) {
        return result
      }

      // If result is a single object, wrap it as a single item array
      return {
        dados: [result as any],
        paginacao: {
          totalItens: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 1
        }
      }
    } catch (error) {
      console.error('Error in listarFuncionariosComUltimoApontamento:', error)
      throw error
    }
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