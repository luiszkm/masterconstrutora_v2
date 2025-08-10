import { 
  CronogramaRecebimento, 
  CriarCronogramaRequest, 
  CriarCronogramaLoteRequest 
} from "@/types/api-types"
import { API_BASE_URL, DEFAULT_HEADERS, type RequestOptions } from "@/app/lib/api-config"

class CronogramaService {
  private baseUrl = `${API_BASE_URL}`

  private async request<T>(
    endpoint: string, 
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, next, ...fetchOptions } = options
    
    const headers = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    }

    // Adicionar token de autenticação se não foi pulado
    if (!skipAuth) {
      // Aqui você pode adicionar a lógica de autenticação
      // Por exemplo: headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
      next,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Lista cronogramas de uma obra
   */
  async listarCronogramas(obraId: string): Promise<CronogramaRecebimento[]> {
    return this.request<CronogramaRecebimento[]>(`/obras/${obraId}/cronograma-recebimentos`)
  }

  /**
   * Criar cronograma individual
   */
  async criarCronograma(dados: CriarCronogramaRequest): Promise<CronogramaRecebimento> {
    return this.request<CronogramaRecebimento>(`/cronograma-recebimentos`, {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  /**
   * Criar cronograma em lote
   */
  async criarCronogramaLote(dados: CriarCronogramaLoteRequest): Promise<CronogramaRecebimento[]> {
    return this.request<CronogramaRecebimento[]>(`/cronograma-recebimentos/lote`, {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  /**
   * Atualizar cronograma
   */
  async atualizarCronograma(id: string, dados: Partial<CriarCronogramaRequest>): Promise<CronogramaRecebimento> {
    return this.request<CronogramaRecebimento>(`/cronograma-recebimentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  /**
   * Excluir cronograma
   */
  async excluirCronograma(id: string): Promise<void> {
    return this.request<void>(`/cronograma-recebimentos/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Marcar como recebido
   */
  async marcarComoRecebido(id: string, valorRecebido: number, dataRecebimento: string): Promise<CronogramaRecebimento> {
    return this.request<CronogramaRecebimento>(`/cronograma-recebimentos/${id}/receber`, {
      method: 'PATCH',
      body: JSON.stringify({ valorRecebido, dataRecebimento }),
    })
  }
}

export const cronogramaService = new CronogramaService()