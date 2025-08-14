"use server"

import type {
  DashboardFilters,
  DashboardData,
  FinanceiroData,
  ObrasData,
  FuncionariosData,
  FornecedoresData,
} from "@/services/dashboard-service"
import { API_URL, makeAuthenticatedRequest } from "./common"

async function makeAuthenticatedDashboardRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string }> {
  try {
    const DASHBOARD_BASE_URL = `${API_URL}/dashboard`
    
    const response = await makeAuthenticatedRequest(`${DASHBOARD_BASE_URL}${endpoint}`, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return { data }
  } catch (error: any) {
    console.error("Dashboard API Error:", error)
    return { error: error.message || "Erro interno do servidor" }
  }
}

// Função para construir query string
function buildQueryString(filters: DashboardFilters): string {
  const params = new URLSearchParams()

  if (filters.dataInicio) params.append("dataInicio", filters.dataInicio)
  if (filters.dataFim) params.append("dataFim", filters.dataFim)
  if (filters.secoes?.length) params.append("secoes", filters.secoes.join(","))
  if (filters.obraIds?.length) params.append("obraIds", filters.obraIds.join(","))
  if (filters.fornecedorIds?.length) params.append("fornecedorIds", filters.fornecedorIds.join(","))
  if (filters.incluirInativos !== undefined) params.append("incluirInativos", filters.incluirInativos.toString())

  return params.toString()
}

// Server Actions
export async function getDashboardCompletoAction(filters: DashboardFilters = {}) {
  const queryString = buildQueryString(filters)
  const endpoint = queryString ? `?${queryString}` : ""
  return makeAuthenticatedDashboardRequest<DashboardData>(endpoint)
}

export async function getDashboardFinanceiroAction(filters: DashboardFilters = {}) {
  const queryString = buildQueryString(filters)
  const endpoint = `/financeiro${queryString ? `?${queryString}` : ""}`
  return makeAuthenticatedDashboardRequest<FinanceiroData>(endpoint)
}

export async function getDashboardObrasAction(filters: DashboardFilters = {}) {
  const queryString = buildQueryString(filters)
  const endpoint = `/obras${queryString ? `?${queryString}` : ""}`
  return makeAuthenticatedDashboardRequest<ObrasData>(endpoint)
}

export async function getDashboardFuncionariosAction(filters: DashboardFilters = {}) {
  const queryString = buildQueryString(filters)
  const endpoint = `/funcionarios${queryString ? `?${queryString}` : ""}`
  return makeAuthenticatedDashboardRequest<FuncionariosData>(endpoint)
}

export async function getDashboardFornecedoresAction(filters: DashboardFilters = {}) {
  const queryString = buildQueryString(filters)
  const endpoint = `/fornecedores${queryString ? `?${queryString}` : ""}`
  return makeAuthenticatedDashboardRequest<FornecedoresData>(endpoint)
}

export async function getFluxoCaixaAction(filters: DashboardFilters = {}) {
  const queryString = buildQueryString(filters)
  const endpoint = `/fluxo-caixa${queryString ? `?${queryString}` : ""}`
  return makeAuthenticatedDashboardRequest<FinanceiroData["fluxoCaixa"]>(endpoint)
}

export async function getCacheInfoAction() {
  return makeAuthenticatedDashboardRequest<{
    ultimaAtualizacao: string
    ttlRecomendado: number
    secoesDisponiveis: string[]
    versao: string
  }>("/cache-info")
}
