"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { CronogramaRecebimento, CriarCronogramaRequest, CriarCronogramaLoteRequest } from "@/types/api-types"
import { API_URL, makeAuthenticatedRequest } from "./common"

export interface CronogramaActionResult {
  success: boolean
  error?: string
  data?: CronogramaRecebimento | CronogramaRecebimento[]
}

export async function listarCronogramasAction(obraId: string): Promise<{
  success: boolean
  data?: CronogramaRecebimento[]
  error?: string
}> {
  try {
    console.log('🌐 Fazendo requisição para:', `${API_URL}/obras/${obraId}/cronograma-recebimentos`)
    const response = await makeAuthenticatedRequest(`${API_URL}/obras/${obraId}/cronograma-recebimentos`)
    
    console.log('📡 Status da resposta:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro da API:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📦 Dados recebidos da API:', data)
    console.log('📊 Tipo dos dados:', typeof data, 'É array?', Array.isArray(data))
    
    return { success: true, data }
  } catch (error) {
    console.error("💥 Erro ao buscar cronogramas:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar cronogramas"
    }
  }
}

export async function criarCronogramaAction(dados: CriarCronogramaRequest): Promise<CronogramaActionResult> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Revalidar as páginas relacionadas
    revalidatePath(`/dashboard/obras/${dados.obraId}`)
    revalidateTag('cronogramas')
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar cronograma:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar cronograma"
    }
  }
}

export async function criarCronogramaLoteAction(dados: CriarCronogramaLoteRequest): Promise<CronogramaActionResult> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos/lote`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Revalidar as páginas relacionadas
    revalidatePath(`/dashboard/obras/${dados.obraId}`)
    revalidateTag('cronogramas')
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar cronograma em lote:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar cronogramas"
    }
  }
}

export async function atualizarCronogramaAction(
  id: string, 
  dados: Partial<CriarCronogramaRequest>
): Promise<CronogramaActionResult> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Revalidar as páginas relacionadas
    revalidateTag('cronogramas')
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atualizar cronograma:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar cronograma"
    }
  }
}

export async function excluirCronogramaAction(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Revalidar as páginas relacionadas
    revalidateTag('cronogramas')
    
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir cronograma:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir cronograma"
    }
  }
}

export async function marcarComoRecebidoAction(
  id: string, 
  valorRecebido: number, 
  dataRecebimento: string
): Promise<CronogramaActionResult> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos/${id}/receber`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ valorRecebido, dataRecebimento }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Revalidar as páginas relacionadas
    revalidateTag('cronogramas')
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao marcar cronograma como recebido:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao marcar como recebido"
    }
  }
}
