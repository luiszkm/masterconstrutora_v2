import { apiClient } from "@/lib/api-client"
import { DEFAULT_CACHE_TIME, LONG_CACHE_TIME } from "@/lib/api-config"
import type { Obra, FilterOptions, PaginatedResponse } from "@/types/api-types"

/**
 * Serviço para gerenciar obras
 */
export const obrasService = {
  /**
   * Busca todas as obras com paginação e filtros
   */
  async listarObras(filtros?: FilterOptions): Promise<PaginatedResponse<Obra>> {
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

    return apiClient.get<PaginatedResponse<Obra>>(`/obras${query}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: ["obras"],
      },
    })
  },

  /**
   * Busca uma obra pelo ID
   */
  async obterObra(id: string): Promise<Obra> {
    return apiClient.get<Obra>(`/obras/${id}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`obra-${id}`],
      },
    })
  },

  /**
   * Cria uma nova obra
   */
  async criarObra(obra: Omit<Obra, "id">): Promise<Obra> {
    return apiClient.post<Obra>("/obras", obra)
  },

  /**
   * Atualiza uma obra existente
   */
  async atualizarObra(id: string, obra: Partial<Obra>): Promise<Obra> {
    return apiClient.put<Obra>(`/obras/${id}`, obra)
  },

  /**
   * Remove uma obra
   */
  async removerObra(id: string): Promise<void> {
    return apiClient.delete<void>(`/obras/${id}`)
  },

  /**
   * Atualiza o progresso de uma obra
   */
  async atualizarProgresso(id: string, progresso: number): Promise<Obra> {
    return apiClient.patch<Obra>(`/obras/${id}/progresso`, { progresso })
  },

  /**
   * Adiciona uma imagem à obra
   */
  async adicionarImagem(id: string, imagem: string): Promise<Obra> {
    return apiClient.post<Obra>(`/obras/${id}/imagens`, { imagem })
  },

  /**
   * Remove uma imagem da obra
   */
  async removerImagem(id: string, imagemUrl: string): Promise<Obra> {
    return apiClient.delete<Obra>(`/obras/${id}/imagens?url=${encodeURIComponent(imagemUrl)}`)
  },

  /**
   * Adiciona um documento à obra
   */
  async adicionarDocumento(
    id: string,
    documento: {
      nome: string
      url: string
      tipo: string
    },
  ): Promise<Obra> {
    return apiClient.post<Obra>(`/obras/${id}/documentos`, documento)
  },

  /**
   * Remove um documento da obra
   */
  async removerDocumento(id: string, documentoId: string): Promise<Obra> {
    return apiClient.delete<Obra>(`/obras/${id}/documentos/${documentoId}`)
  },

  /**
   * Busca estatísticas de obras
   */
  async obterEstatisticas(): Promise<{
    total: number
    concluidas: number
    emAndamento: number
    atrasadas: number
    distribuicaoPorTipo: Array<{
      tipo: string
      quantidade: number
      porcentagem: number
    }>
  }> {
    return apiClient.get<any>("/obras/estatisticas", {
      next: {
        revalidate: LONG_CACHE_TIME,
        tags: ["obras-estatisticas"],
      },
    })
  },
}
