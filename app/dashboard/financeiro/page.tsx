import {FinanceiroClient} from "./components/financeiro-client"
import type { ContaPagar, ContaReceber, FluxoCaixaResponse } from "@/types/financeiro"
import {
  getContasPagar,
  getContasPagarVencidas,
  getContasReceber,
  getContasReceberVencidas,
  getFluxoDeCaixa,
} from "@/app/actions/financeiro"

const statusColors: Record<string, string> = {
  PENDENTE: "bg-yellow-500",
  PARCIAL: "bg-amber-500",
  RECEBIDO: "bg-green-600",
  PAGO: "bg-green-600",
  VENCIDO: "bg-red-600",
  CANCELADO: "bg-gray-500",
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("pt-BR")
}

export default async function FinanceiroPage() {
  const [receberRes, pagarRes, vencRecRes, vencPagRes] = await Promise.all([
    getContasReceber(),
    getContasPagar(),
    getContasReceberVencidas(),
    getContasPagarVencidas(),
  ])



  // Valores default em caso de erro
  const contasReceber: ContaReceber[] = Array.isArray(receberRes) ? receberRes : (receberRes && typeof receberRes === 'object' && "error" in receberRes ? [] : receberRes || [])
  const contasPagar: ContaPagar[] = Array.isArray(pagarRes) ? pagarRes : (pagarRes && typeof pagarRes === 'object' && "error" in pagarRes ? [] : pagarRes || [])
  const vencidasReceber: ContaReceber[] = Array.isArray(vencRecRes) ? vencRecRes : (vencRecRes && typeof vencRecRes === 'object' && "error" in vencRecRes ? [] : vencRecRes || [])
  const vencidasPagar: ContaPagar[] = Array.isArray(vencPagRes) ? vencPagRes : (vencPagRes && typeof vencPagRes === 'object' && "error" in vencPagRes ? [] : vencPagRes || [])



  // Fluxo de caixa padrão 3 meses
  const fim = new Date()
  const ini = new Date()
  ini.setMonth(ini.getMonth() - 6)
  const dataInicio = ini.toISOString().slice(0, 10)
  const dataFim = fim.toISOString().slice(0, 10)

  const fluxoRes = await getFluxoDeCaixa({ dataInicio, dataFim })
  const fluxo: FluxoCaixaResponse | null = fluxoRes && typeof fluxoRes === 'object' && "error" in fluxoRes ? null : (fluxoRes as FluxoCaixaResponse)

  return (
    <FinanceiroClient
      initialReceber={contasReceber}
      initialPagar={contasPagar}
      initialVencidasReceber={vencidasReceber}
      initialVencidasPagar={vencidasPagar}
      initialFluxo={fluxo}
      defaultDataInicio={dataInicio}
      defaultDataFim={dataFim}
    />
  )
}
