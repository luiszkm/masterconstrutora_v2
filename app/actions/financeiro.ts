"use server"

import { revalidatePath } from "next/cache"
import { API_URL, makeAuthenticatedRequest } from "./common"
import type { ContaReceber, ContaPagar, FluxoCaixaResponse } from "@/types/financeiro"
import { validateFormData } from "@/lib/validations/common"
import { contaPagarSchema, contaReceberSchema, registrarPagamentoSchema, registrarRecebimentoSchema } from "@/lib/validations/financeiro"
import { createSuccessResponse, createErrorResponse, type CreateActionResponse, type ActionResponse } from "@/types/action-responses"

// GETs — seguem o padrão: retornam lista ou { error }
export async function getContasReceber(): Promise<ContaReceber[] | { error: string }> {
  try {
    const res = await makeAuthenticatedRequest(`${API_URL}/contas-receber`, {
      method: "GET",
      next: { tags: ["contas-receber"] },
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        return { error: err.message || "Erro ao buscar contas a receber." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao buscar contas a receber." }
      }
    }
    const data: ContaReceber[] = await res.json()
    return data
  } catch (e) {
    console.error("getContasReceber error:", e)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getContasPagar(): Promise<ContaPagar[] | { error: string }> {
  try {
    const res = await makeAuthenticatedRequest(`${API_URL}/contas-pagar`, {
      method: "GET",
      next: { tags: ["contas-pagar"] },
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        return { error: err.message || "Erro ao buscar contas a pagar." }
      } catch {
        return { error: res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao buscar contas a pagar." }
      }
    }
    const data: ContaPagar[] = await res.json()
    return data
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
    if (!input.contaId || !input.valor || input.valor <= 0) {
      return createErrorResponse("Informe contaId e valor válido.")
    }
    const res = await makeAuthenticatedRequest(
      `${API_URL}/contas-receber/${input.contaId}/recebimentos`,
      { method: "POST", body: JSON.stringify(input) },
    )
    if (!res.ok) {
      try {
        const err = await res.json()
        return createErrorResponse(err.message || "Erro ao registrar recebimento.")
      } catch {
        return createErrorResponse(res.status === 401 ? "Não autorizado. Faça login novamente." : "Erro ao registrar recebimento.")
      }
    }
    revalidatePath("/financeiro")
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
