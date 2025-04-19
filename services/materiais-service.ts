import { apiClient } from "@/lib/api-client"
import { DEFAULT_CACHE_TIME, LONG_CACHE_TIME } from "@/lib/api-config"
import type { Material, FilterOptions, PaginatedResponse } from "@/types/api-types"

/**
 * Serviço para gerenciar materiais
 */
export const materiaisService = {
  /**
   * Busca todos os materiais com paginação e filtros
   */
  async listarMateriais(filtros?: FilterOptions): Promise<PaginatedResponse<Material>> {
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

    return apiClient.get<PaginatedResponse<Material>>(`/materiais${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["materiais"],
      },
    })
  },

  /**
   * Busca um material pelo ID
   */
  async obterMaterial(id: string): Promise<Material> {
    return apiClient.get<Material>(`/materiais/${id}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`material-${id}`],
      },
    })
  },

  /**
   * Cria um novo material
   */
  async criarMaterial(material: Omit<Material, "id">): Promise<Material> {
    return apiClient.post<Material>("/materiais", material)
  },

  /**
   * Atualiza um material existente
   */
  async atualizarMaterial(id: string, material: Partial<Material>): Promise<Material> {
    return apiClient.put<Material>(`/materiais/${id}`, material)
  },

  /**
   * Remove um material
   */
  async removerMaterial(id: string): Promise<void> {
    return apiClient.delete<void>(`/materiais/${id}`)
  },

  /**
   * Atualiza o estoque de um material
   */
  async atualizarEstoque(
    id: string,
    quantidade: number,
    operacao: "adicionar" | "remover" | "definir",
  ): Promise<Material> {
    return apiClient.patch<Material>(`/materiais/${id}/estoque`, { quantidade, operacao })
  },

  /**
   * Busca o histórico de preços de um material
   */
  async obterHistoricoPrecos(id: string): Promise<
    Array<{
      data: string
      preco: number
      fornecedorId?: string
      fornecedorNome?: string
    }>
  > {
    return apiClient.get<any>(`/materiais/${id}/historico-precos`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`material-${id}-precos`],
      },
    })
  },

  /**
   * Busca estatísticas de materiais
   */
  async obterEstatisticas(): Promise<{
    total: number
    emEstoque: number
    baixoEstoque: number
    semEstoque: number
    valorTotal: number
    distribuicaoPorCategoria: Array<{
      categoria: string
      valor: number
      porcentagem: number
    }>
  }> {
    return apiClient.get<any>("/materiais/estatisticas", {
      next: {
        revalidate: LONG_CACHE_TIME,
        tags: ["materiais-estatisticas"],
      },
    })
  },
}
