import type { EtapasResponse, EtapaAPI, AtualizarEtapaRequest } from "@/types/api-types"
import { apiClient } from "@/app/lib/api-client"
import { DEFAULT_CACHE_TIME } from "@/app/lib/api-config"

/**
 * Service para gerenciar etapas de obras
 */
class EtapasService {

  /**
   * Buscar todas as etapas de uma obra
   */
  async obterEtapasObra(obraId: string): Promise<EtapasResponse> {
    return apiClient.get<EtapasResponse>(`/obras/${obraId}/etapas`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`etapas-obra-${obraId}`],
      },
    })
  }

  /**
   * Atualizar status de uma etapa específica
   */
  async atualizarStatusEtapa(
    etapaId: string,
    dados: AtualizarEtapaRequest
  ): Promise<EtapaAPI> {
    return apiClient.patch<EtapaAPI>(`/etapas/${etapaId}`, dados, {
      // Não usar cache para operações de escrita
      next: { revalidate: 0 }
    })
  }

  /**
   * Buscar uma etapa específica por ID
   */
  async obterEtapaPorId(etapaId: string): Promise<EtapaAPI> {
    return apiClient.get<EtapaAPI>(`/etapas/${etapaId}`, {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`etapa-${etapaId}`],
      },
    })
  }
}

// Export da instância singleton
export const etapasService = new EtapasService()