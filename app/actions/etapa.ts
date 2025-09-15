"use server"

import { revalidateTag } from "next/cache"
import type { EtapaAPI, EtapasResponse, AtualizarEtapaRequest } from "@/types/api-types"
import type { EtapaObra } from "./obra"
import { etapasService } from "@/services/etapas-service"
import { createSuccessResponse, createErrorResponse, type ActionResponse } from "@/types/action-responses"

/**
 * Buscar todas as etapas de uma obra
 */
export async function obterEtapasObraAction(
  obraId: string
): Promise<ActionResponse<EtapaObra[]>> {
  try {
    const response = await etapasService.obterEtapasObra(obraId)

    // Converter dados da API para formato interno
    const etapas: EtapaObra[] = response.dados.map((etapaAPI) => ({
      id: etapaAPI.ID,
      nome: etapaAPI.Nome,
      status: etapaAPI.Status,
      dataInicioPrevista: etapaAPI.data_inicio_prevista,
      dataFimPrevista: etapaAPI.data_fim_prevista,
    }))

    return createSuccessResponse("Etapas carregadas com sucesso", etapas)
  } catch (error) {
    console.error("Erro ao buscar etapas da obra:", error)

    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Obra não encontrada")
      }
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      return createErrorResponse(error.message)
    }

    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * Atualizar status de uma etapa específica
 */
export async function atualizarStatusEtapaAction(
  etapaId: string,
  status: "Completa" | "Em Andamento" | "Pendente",
  dataInicioReal?: string
): Promise<ActionResponse<EtapaAPI>> {
  try {
    // Validações básicas
    if (!etapaId || !etapaId.trim()) {
      return createErrorResponse("ID da etapa é obrigatório")
    }

    if (!["Completa", "Em Andamento", "Pendente"].includes(status)) {
      return createErrorResponse("Status inválido")
    }

    // Preparar dados para envio
    const dados: AtualizarEtapaRequest = { status }

    if (dataInicioReal) {
      dados.dataInicioReal = dataInicioReal
    }

    // Se marcando como completa, adicionar data fim real
    if (status === "Completa" && !dados.dataFimReal) {
      dados.dataFimReal = new Date().toISOString().split('T')[0]
    }

    const response = await etapasService.atualizarStatusEtapa(etapaId, dados)

    // Revalidar cache relacionado
    revalidateTag(`etapa-${etapaId}`)
    // Revalidar cache das etapas da obra (assumindo que temos o obraId no response)
    if (response.ObraID) {
      revalidateTag(`etapas-obra-${response.ObraID}`)
      revalidateTag(`obra-${response.ObraID}`)
    }

    return createSuccessResponse("Status da etapa atualizado com sucesso", response)
  } catch (error) {
    console.error("Erro ao atualizar status da etapa:", error)

    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Etapa não encontrada")
      }
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      if (error.message.includes("já está")) {
        return createErrorResponse("Esta etapa já possui este status")
      }
      return createErrorResponse(error.message)
    }

    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * Buscar uma etapa específica por ID
 */
export async function obterEtapaPorIdAction(
  etapaId: string
): Promise<ActionResponse<EtapaObra>> {
  try {
    const response = await etapasService.obterEtapaPorId(etapaId)

    // Converter dados da API para formato interno
    const etapa: EtapaObra = {
      id: response.ID,
      nome: response.Nome,
      status: response.Status,
      dataInicioPrevista: response.data_inicio_prevista,
      dataFimPrevista: response.data_fim_prevista,
    }

    return createSuccessResponse("Etapa encontrada com sucesso", etapa)
  } catch (error) {
    console.error("Erro ao buscar etapa:", error)

    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Etapa não encontrada")
      }
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      return createErrorResponse(error.message)
    }

    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}