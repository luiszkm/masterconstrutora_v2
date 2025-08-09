export type ContaReceber = {
  id: string
  obraId?: string | null
  cronogramaRecebimentoId?: string | null
  cliente: string
  tipoContaReceber: "OBRA" | "SERVICO" | "OUTROS"
  descricao: string
  valorOriginal: number
  valorRecebido: number
  dataVencimento: string
  dataRecebimento?: string | null
  status: "PENDENTE" | "RECEBIDO" | "VENCIDO" | "PARCIAL" | "CANCELADO"
  formaPagamento?: string | null
  observacoes?: string | null
  numeroDocumento?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ContaPagar = {
  id: string
  fornecedorId?: string | null
  obraId?: string | null
  orcamentoId?: string | null
  fornecedorNome: string
  tipoContaPagar: "FORNECEDOR" | "SERVICO" | "MATERIAL" | "OUTROS"
  descricao: string
  valorOriginal: number
  valorPago: number
  dataVencimento: string
  dataPagamento?: string | null
  status: "PENDENTE" | "PAGO" | "VENCIDO" | "PARCIAL" | "CANCELADO"
  formaPagamento?: string | null
  observacoes?: string | null
  numeroDocumento?: string | null
  numeroCompraNf?: string | null
  createdAt?: string
  updatedAt?: string
}

export type FluxoCaixaResponse = {
  totalEntradas: number
  totalSaidas: number
  saldoAtual: number
  fluxoPorPeriodo: { periodo: string; entradas: number; saidas: number; saldoLiquido: number }[]
  tendenciaMensal?: string
}

// Proxy interno para evitar CORS e desacoplar a URL do backend
async function api(path: string, init?: RequestInit) {
  const res = await fetch(`/api/financeiro${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    return res.json()
  }
  return res.text()
}

// Contas a Receber
export async function getContasReceber(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : ""
  const data = await api(`/contas-receber${qs}`)
  // Tenta mapear formatos comuns: {items:[]}, {data:[]}, [] diretamente
  const items: ContaReceber[] = Array.isArray(data) ? data : data.items || data.data || []
  return items
}

export async function getContasReceberVencidas() {
  const data = await api(`/contas-receber/vencidas`)
  const items: ContaReceber[] = Array.isArray(data) ? data : data.items || data.data || []
  return items
}

export async function postRecebimentoContaReceber(
  contaId: string,
  body: { valor: number; formaPagamento?: string; observacoes?: string; contaBancariaId?: string },
) {
  return api(`/contas-receber/${contaId}/recebimentos`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// Contas a Pagar
export async function getContasPagar(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : ""
  const data = await api(`/contas-pagar${qs}`)
  const items: ContaPagar[] = Array.isArray(data) ? data : data.items || data.data || []
  return items
}

export async function getContasPagarVencidas() {
  const data = await api(`/contas-pagar/vencidas`)
  const items: ContaPagar[] = Array.isArray(data) ? data : data.items || data.data || []
  return items
}

export async function postPagamentoContaPagar(
  contaId: string,
  body: { valor: number; formaPagamento?: string; observacoes?: string; contaBancariaId?: string },
) {
  return api(`/contas-pagar/${contaId}/pagamentos`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// Fluxo de Caixa
export async function getFluxoDeCaixa({ dataInicio, dataFim }: { dataInicio: string; dataFim: string }) {
  const qs = `?${new URLSearchParams({ dataInicio, dataFim })}`
  const data = await api(`/dashboard/fluxo-caixa${qs}`)
  return data as FluxoCaixaResponse
}
