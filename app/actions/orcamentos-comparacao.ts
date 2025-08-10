"use server"

import { ComparacaoOrcamentosResponse } from "@/types/api-types"
import { API_URL, makeAuthenticatedRequest } from "./common"

export interface ComparacaoActionResult {
  success: boolean
  error?: string
  data?: ComparacaoOrcamentosResponse
}

/**
 * Compara orçamentos por categoria/material
 */
export async function compararOrcamentosPorCategoria(categoria: string): Promise<ComparacaoActionResult> {
  try {
    console.log('🔍 Comparando orçamentos para categoria:', categoria)
    
    const response = await makeAuthenticatedRequest(
      `${API_URL}/orcamentos/comparar?categoria=${encodeURIComponent(categoria)}`
    )
    
    console.log('📡 Status da resposta:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro da API:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📦 Dados recebidos da API:', data)
    
    return { success: true, data }
  } catch (error) {
    console.error("💥 Erro ao comparar orçamentos:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao comparar orçamentos"
    }
  }
}

/**
 * Obter categorias disponíveis para comparação
 */
export async function obterCategoriasDisponiveis(): Promise<{
  success: boolean
  error?: string
  data?: string[]
}> {
  try {
    console.log('🔍 Obtendo categorias disponíveis...')
    
    const response = await makeAuthenticatedRequest(
      `${API_URL}/orcamentos/categorias`
    )
    
    console.log('📡 Status da resposta:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro da API:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📦 Categorias recebidas da API:', data)
    
    return { success: true, data }
  } catch (error) {
    console.error("💥 Erro ao obter categorias:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao obter categorias"
    }
  }
}