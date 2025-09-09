import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME } from "@/app/lib/api-config"
import type { Cliente, Obra, FilterOptions, BackendPaginatedResponse } from "@/types/api-types"

/**
 * Serviço para gerenciar clientes
 */
export const clientesService = {
  /**
   * Busca todos os clientes com paginação e filtros
   */
  async listarClientes(filtros?: FilterOptions): Promise<BackendPaginatedResponse<Cliente>> {
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

    return apiClient.get<BackendPaginatedResponse<Cliente>>(`/clientes${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["clientes"],
      },
    })
  },

  /**
   * Busca um cliente pelo ID
   */
  async obterCliente(id: string): Promise<Cliente> {
    return apiClient.get<Cliente>(`/clientes/${id}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`cliente-${id}`],
      },
    })
  },

  /**
   * Cria um novo cliente
   */
  async criarCliente(cliente: Omit<Cliente, "id">): Promise<Cliente> {
    return apiClient.post<Cliente>("/clientes", cliente)
  },

  /**
   * Atualiza um cliente existente
   */
  async atualizarCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    return apiClient.put<Cliente>(`/clientes/${id}`, cliente)
  },

  /**
   * Remove um cliente
   */
  async removerCliente(id: string): Promise<void> {
    return apiClient.delete<void>(`/clientes/${id}`)
  },

  /**
   * Busca as obras de um cliente
   */
  async listarObras(clienteId: string, filtros?: FilterOptions): Promise<BackendPaginatedResponse<Obra>> {
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

    return apiClient.get<BackendPaginatedResponse<Obra>>(`/clientes/${clienteId}/obras${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`cliente-${clienteId}-obras`],
      },
    })
  },
}
