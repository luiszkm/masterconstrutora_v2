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
