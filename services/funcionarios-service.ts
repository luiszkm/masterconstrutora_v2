import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME, LONG_CACHE_TIME } from "@/app/lib/api-config"
import type { Funcionario, PagamentoFuncionario, FilterOptions, PaginatedResponse } from "@/types/api-types"

/**
 * Serviço para gerenciar funcionários
 */
export const funcionariosService = {
  /**
   * Busca todos os funcionários com paginação e filtros
   */
  async listarFuncionarios(filtros?: FilterOptions): Promise<PaginatedResponse<Funcionario>> {
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

    return apiClient.get<PaginatedResponse<Funcionario>>(`/funcionarios${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["funcionarios"],
      },
    })
  },

  /**
   * Busca um funcionário pelo ID
   */
  async obterFuncionario(id: string): Promise<Funcionario> {
    return apiClient.get<Funcionario>(`/funcionarios/${id}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`funcionario-${id}`],
      },
    })
  },

  /**
   * Cria um novo funcionário
   */
  async criarFuncionario(funcionario: Omit<Funcionario, "id">): Promise<Funcionario> {
    return apiClient.post<Funcionario>("/funcionarios", funcionario)
  },

  /**
   * Atualiza um funcionário existente
   */
  async atualizarFuncionario(id: string, funcionario: Partial<Funcionario>): Promise<Funcionario> {
    return apiClient.put<Funcionario>(`/funcionarios/${id}`, funcionario)
  },

  /**
   * Remove um funcionário
   */
  async removerFuncionario(id: string): Promise<void> {
    return apiClient.delete<void>(`/funcionarios/${id}`)
  },

  /**
   * Busca o histórico de pagamentos de um funcionário
   */
  async listarPagamentos(
    funcionarioId: string,
    filtros?: FilterOptions,
  ): Promise<PaginatedResponse<PagamentoFuncionario>> {
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

    return apiClient.get<PaginatedResponse<PagamentoFuncionario>>(`/funcionarios/${funcionarioId}/pagamentos${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`funcionario-${funcionarioId}-pagamentos`],
      },
    })
  },

  /**
   * Registra um novo pagamento para um funcionário
   */
  async registrarPagamento(
    funcionarioId: string,
    pagamento: Omit<PagamentoFuncionario, "id" | "funcionarioId">,
  ): Promise<PagamentoFuncionario> {
    return apiClient.post<PagamentoFuncionario>(`/funcionarios/${funcionarioId}/pagamentos`, pagamento)
  },

  /**
   * Atualiza o status de um pagamento
   */
  async atualizarPagamento(pagamentoId: string, dados: Partial<PagamentoFuncionario>): Promise<PagamentoFuncionario> {
    return apiClient.patch<PagamentoFuncionario>(`/pagamentos/${pagamentoId}`, dados)
  },

  /**
   * Registra múltiplos pagamentos de uma vez
   */
  async registrarPagamentosEmMassa(
    pagamentos: Array<{
      funcionarioId: string
      valor: number
      data: string
      tipo: PagamentoFuncionario["tipo"]
      descricao?: string
      referencia: {
        mes: number
        ano: number
      }
    }>,
    comprovante?: string,
  ): Promise<PagamentoFuncionario[]> {
    return apiClient.post<PagamentoFuncionario[]>("/pagamentos/massa", {
      pagamentos,
      comprovante,
    })
  },

  /**
   * Busca estatísticas de funcionários
   */
  async obterEstatisticas(): Promise<{
    total: number
    ativos: number
    afastados: number
    distribuicaoPorDepartamento: Array<{
      departamento: string
      quantidade: number
      porcentagem: number
    }>
    custoMensal: number
  }> {
    return apiClient.get<any>("/funcionarios/estatisticas", {
      next: {
        revalidate: LONG_CACHE_TIME,
        tags: ["funcionarios-estatisticas"],
      },
    })
  },
}
