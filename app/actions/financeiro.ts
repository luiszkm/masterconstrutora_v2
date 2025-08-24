"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { API_URL, makeAuthenticatedRequest } from "./common"
import type { ContaReceber, ContaPagar, FluxoCaixaResponse } from "@/types/financeiro"

import { createSuccessResponse, createErrorResponse, type CreateActionResponse, type ActionResponse } from "@/types/action-responses"

// GETs — seguem o padrão: retornam lista ou { error }
export async function getContasReceber(page = 1, pageSize = 50): Promise<ContaReceber[] | { error: string }> {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const res = await makeAuthenticatedRequest(`${API_URL}/contas-receber?${searchParams.toString()}`, {
      method: "GET",
      next: { tags: ["contas-receber"] },
    })
    console.log('🔍 getContasReceber - URL:', `${API_URL}/contas-receber?${searchParams.toString()}`)
    console.log('🔍 getContasReceber - Response status:', res.status)
    
    if (!res.ok) {
      try {
        const err = await res.json()
        console.log('❌ getContasReceber - Error response:', err)
        return { error: err.message || "Erro ao buscar contas a receber." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao buscar contas a receber." }
      }
    }
    const data = await res.json()
    console.log('📦 getContasReceber - Response data:', data)
    
    // Se a API retornar um objeto com propriedade 'data' ou 'dados', extrair o array
    const contasArray = Array.isArray(data) ? data : (data.data || data.dados || data.items || [])
    console.log('📋 getContasReceber - Extracted array:', contasArray)
    
    return contasArray
  } catch (e) {
    console.error("getContasReceber error:", e)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getContasPagar(page = 1, pageSize = 50): Promise<ContaPagar[] | { error: string }> {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const res = await makeAuthenticatedRequest(`${API_URL}/contas-pagar?${searchParams.toString()}`, {
      method: "GET",
      next: { tags: ["contas-pagar"] },
    })
    console.log('🔍 getContasPagar - URL:', `${API_URL}/contas-pagar?${searchParams.toString()}`)
    console.log('🔍 getContasPagar - Response status:', res.status)
    
    if (!res.ok) {
      try {
        const err = await res.json()
        console.log('❌ getContasPagar - Error response:', err)
        return { error: err.message || "Erro ao buscar contas a pagar." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao buscar contas a pagar." }
      }
    }
    const data = await res.json()
    console.log('📦 getContasPagar - Response data:', data)
    
    // Se a API retornar um objeto com propriedade 'data' ou 'dados', extrair o array
    const contasArray = Array.isArray(data) ? data : (data.data || data.dados || data.items || [])
    console.log('📋 getContasPagar - Extracted array:', contasArray)
    
    return contasArray
  } catch (e) {
    console.error("getContasPagar error:", e)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getContasReceberVencidas(): Promise<ContaReceber[] | { error: string }> {
  try {
    const res = await makeAuthenticatedRequest(`${API_URL}/contas-receber/vencidas`, {
      method: "GET",
      next: { tags: ["contas-receber-vencidas"] },
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        return { error: err.message || "Erro ao buscar contas a receber vencidas." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao buscar contas vencidas." }
      }
    }
    const data: ContaReceber[] = await res.json()
    return data
  } catch (e) {
    console.error("getContasReceberVencidas error:", e)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getContasPagarVencidas(): Promise<ContaPagar[] | { error: string }> {
  try {
    const res = await makeAuthenticatedRequest(`${API_URL}/contas-pagar/vencidas`, {
      method: "GET",
      next: { tags: ["contas-pagar-vencidas"] },
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        return { error: err.message || "Erro ao buscar contas a pagar vencidas." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao buscar contas vencidas." }
      }
    }
    const data: ContaPagar[] = await res.json()
    return data
  } catch (e) {
    console.error("getContasPagarVencidas error:", e)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getFluxoDeCaixa({
  dataInicio,
  dataFim,
}: {
  dataInicio: string
  dataFim: string
}): Promise<FluxoCaixaResponse | { error: string }> {
  try {
    const qs = new URLSearchParams({ dataInicio, dataFim }).toString()
    const res = await makeAuthenticatedRequest(`${API_URL}/dashboard/fluxo-caixa?${qs}`, {
      method: "GET",
      next: { tags: ["fluxo-caixa", `fluxo-${dataInicio}-${dataFim}`] },
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        return { error: err.message || "Erro ao obter fluxo de caixa." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao obter fluxo de caixa." }
      }
    }
    const data: FluxoCaixaResponse = await res.json()
    return data
  } catch (e) {
    console.error("getFluxoDeCaixa error:", e)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

// POSTs — seguem o padrão: retornam { success, message }
export async function registrarRecebimento(input: {
  contaId: string
  valor: number
  formaPagamento?: string
  observacoes?: string
  contaBancariaId?: string
}): Promise<ActionResponse> {
  try {
    console.log('💰 registrarRecebimento - Input:', input)
    
    if (!input.contaId || !input.valor || input.valor <= 0) {
      console.log('❌ registrarRecebimento - Validation failed:', { contaId: input.contaId, valor: input.valor })
      return createErrorResponse("Informe contaId e valor válido.")
    }
    
    const url = `${API_URL}/contas-receber/${input.contaId}/recebimentos`
    console.log('🌐 registrarRecebimento - URL:', url)
    console.log('📤 registrarRecebimento - Payload:', JSON.stringify(input))
    
    const res = await makeAuthenticatedRequest(url, { 
      method: "POST", 
      body: JSON.stringify(input),
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('📡 registrarRecebimento - Response status:', res.status)
    
    if (!res.ok) {
      try {
        const err = await res.json()
        console.log('❌ registrarRecebimento - Error response:', err)
        return createErrorResponse(err.message || "Erro ao registrar recebimento.")
      } catch {
        return createErrorResponse(res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao registrar recebimento.")
      }
    }
    
    const responseData = await res.json()
    console.log('✅ registrarRecebimento - Success response:', responseData)
    
    // Revalidar páginas relacionadas
    revalidatePath("/dashboard/financeiro")
    revalidatePath("/dashboard/obras")
    revalidateTag("contas-receber")
    revalidateTag("cronogramas")
    
    return createSuccessResponse("Recebimento registrado com sucesso.")
  } catch (e) {
    console.error("registrarRecebimento error:", e)
    return createErrorResponse("Erro interno do servidor")
  }
}

export async function registrarPagamento(input: {
  contaId: string
  valor: number
  formaPagamento?: string
  observacoes?: string
  contaBancariaId?: string
}): Promise<ActionResponse> {
  try {
    if (!input.contaId || !input.valor || input.valor <= 0) {
      return createErrorResponse("Informe contaId e valor válido.")
    }
    const res = await makeAuthenticatedRequest(
      `${API_URL}/contas-pagar/${input.contaId}/pagamentos`,
      { method: "POST", body: JSON.stringify(input) },
    )
    if (!res.ok) {
      try {
        const err = await res.json()
        return createErrorResponse(err.message || "Erro ao registrar pagamento.")
      } catch {
        return createErrorResponse(res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao registrar pagamento.")
      }
    }
    revalidatePath("/financeiro")
    return createSuccessResponse("Pagamento registrado com sucesso.")
  } catch (e) {
    console.error("registrarPagamento error:", e)
    return createErrorResponse("Erro interno do servidor")
  }
}
