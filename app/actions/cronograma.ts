"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { CronogramaRecebimento, CriarCronogramaRequest, CriarCronogramaLoteRequest } from "@/types/api-types"
import { API_URL, makeAuthenticatedRequest } from "./common"
import { createSuccessResponse, createErrorResponse, type ActionResponse } from "@/types/action-responses"


export async function listarCronogramasAction(obraId: string): Promise<ActionResponse<CronogramaRecebimento[]>> {
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

    // A API retorna { dados: [...], paginacao: {...} }
    return createSuccessResponse("Cronogramas listados com sucesso", data.dados || [])
  } catch (error) {
    console.error("💥 Erro ao buscar cronogramas:", error)
    return createErrorResponse(
      error instanceof Error ? error.message : "Erro ao buscar cronogramas"
    )
  }
}

export async function criarCronogramaAction(dados: CriarCronogramaRequest): Promise<ActionResponse> {
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

    return createSuccessResponse("Operação realizada com sucesso", data)
  } catch (error) {
    console.error("Erro ao criar cronograma:", error)
    return createErrorResponse(
      error instanceof Error ? error.message : "Erro ao criar cronograma"
    )
  }
}

export async function criarCronogramaLoteAction(dados: CriarCronogramaLoteRequest): Promise<ActionResponse> {
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

    return createSuccessResponse("Operação realizada com sucesso", data)
  } catch (error) {
    console.error("Erro ao criar cronograma em lote:", error)
    return createErrorResponse(
      error instanceof Error ? error.message : "Erro ao criar cronogramas"
    )
  }
}

export async function atualizarCronogramaAction(
  id: string,
  dados: Partial<CriarCronogramaRequest>
): Promise<ActionResponse> {
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

    return createSuccessResponse("Operação realizada com sucesso", data)
  } catch (error) {
    console.error("Erro ao atualizar cronograma:", error)
    return createErrorResponse(
      error instanceof Error ? error.message : "Erro ao atualizar cronograma"
    )
  }
}

export async function excluirCronogramaAction(id: string): Promise<ActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Revalidar as páginas relacionadas
    revalidateTag('cronogramas')

    return createSuccessResponse("Cronograma excluído com sucesso")
  } catch (error) {
    console.error("Erro ao excluir cronograma:", error)
    return createErrorResponse(
      error instanceof Error ? error.message : "Erro ao excluir cronograma"
    )
  }
}

export async function marcarComoRecebidoAction(
  id: string,
  valor: number,
  observacoes?: string
): Promise<ActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/cronograma-recebimentos/${id}/recebimentos`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ valor, observacoes }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Revalidar as páginas relacionadas
    revalidateTag('cronogramas')

    return createSuccessResponse("Operação realizada com sucesso", data)
  } catch (error) {
    console.error("Erro ao marcar cronograma como recebido:", error)
    return createErrorResponse(
      error instanceof Error ? error.message : "Erro ao marcar como recebido"
    )
  }
}
