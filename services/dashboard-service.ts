// Tipos baseados na documentação da API
export interface DashboardData {
  resumoGeral: {
    totalObras: number
    obrasEmAndamento: number
    totalFuncionarios: number
    funcionariosAtivos: number
    totalFornecedores: number
    fornecedoresAtivos: number
    saldoFinanceiroAtual: number
    totalInvestido: number
    progressoMedioObras: number
    obrasEmAtraso: number
    percentualAtraso: number
  }
  alertas: {
    obrasComAtraso: string[]
    fornecedoresInativos: string[]
    funcionariosSemApontamento: string[]
    orcamentosPendentes: number
    pagamentosPendentes: number
  }
  financeiro: FinanceiroData
  obras: ObrasData
  funcionarios: FuncionariosData
  fornecedores: FornecedoresData
  ultimaAtualizacao: string
  versaoCache: string
}

export interface FinanceiroData {
  fluxoCaixa: {
    totalEntradas: number
    totalSaidas: number
    saldoAtual: number
    fluxoPorPeriodo: Array<{
      periodo: string
      entradas: number
      saidas: number
      saldoLiquido: number
    }>
    tendenciaMensal: string
  }
  distribuicaoDespesas: {
    totalGasto: number
    distribuicao: Array<{
      categoria: string
      valor: number
      percentual: number
      quantidadeItens: number
    }>
    maiorCategoria: string
    valorMaiorCategoria: number
  }
  ultimaAtualizacao: string
}

export interface ObrasData {
  progresso: {
    progressoMedio: number
    obrasEmAndamento: number
    obrasConcluidas: number
    totalObras: number
    progressoPorObra: Array<{
      obraId: string
      nomeObra: string
      percentualConcluido: number
      etapasConcluidas: number
      etapasTotal: number
      status: string
      dataInicio: string
      dataFimPrevista: string
    }>
  }
  distribuicao: {
    totalObras: number
    distribuicaoPorStatus: Array<{
      status: string
      quantidade: number
      percentual: number
      valorTotal: number
    }>
    statusMaisComum: string
  }
  tendencias: {
    obrasEmAtraso: number
    obrasNoPrazo: number
    percentualAtraso: number
    tendenciaMensal: Array<{
      periodo: string
      obrasIniciadas: number
      obrasConcluidas: number
      obrasEmAtraso: number
    }>
    previsaoConclusaoMes: number
    tendenciaGeral: string
  }
  ultimaAtualizacao: string
}

export interface FuncionariosData {
  produtividade: {
    mediaGeralProdutividade: number
    totalFuncionarios: number
    funcionariosAtivos: number
    produtividadePorFuncionario: Array<{
      funcionarioId: string
      nomeFuncionario: string
      cargo: string
      diasTrabalhados: number
      mediaDiasPorPeriodo: number
      indiceProdutividade: number
      obrasAlocadas: number
    }>
    top5Produtivos: Array<{
      funcionarioId: string
      nomeFuncionario: string
      cargo: string
      diasTrabalhados: number
      mediaDiasPorPeriodo: number
      indiceProdutividade: number
      obrasAlocadas: number
    }>
  }
  custosMaoObra: {
    custoTotalMaoObra: number
    custoMedioFuncionario: number
    custoMedioObra: number
    custosPorFuncionario: Array<{
      funcionarioId: string
      nomeFuncionario: string
      cargo: string
      custoTotal: number
      custoMedio: number
      valorDiaria: number
      periodosTrabalho: number
    }>
    custosPorObra: Array<{
      obraId: string
      nomeObra: string
      custoTotal: number
      custoMedio: number
      numFuncionarios: number
    }>
  }
  topFuncionarios: {
    top5Funcionarios: Array<{
      funcionarioId: string
      nomeFuncionario: string
      cargo: string
      avaliacaoDesempenho: string
      notaAvaliacao: number
      diasTrabalhadosTotal: number
      obrasParticipadas: number
      dataContratacao: string
    }>
    criterioAvaliacao: string
  }
  ultimaAtualizacao: string
}

export interface FornecedoresData {
  fornecedoresPorCategoria: {
    totalFornecedores: number
    totalCategorias: number
    distribuicaoPorCategoria: Array<{
      categoriaId: string
      categoriaNome: string
      quantidadeFornecedores: number
      percentual: number
      avaliacaoMedia: number
    }>
    categoriaMaisPopular: string
    categoriaComMelhorAvaliacao: string
  }
  topFornecedores: {
    top5Fornecedores: Array<{
      fornecedorId: string
      nomeFornecedor: string
      cnpj: string
      avaliacao: number
      status: string
      totalOrcamentos: number
      valorTotalGasto: number
      ultimoOrcamento: string
      categorias: string[]
    }>
    criterioAvaliacao: string
    avaliacaoMedia: number
    fornecedoresAtivos: number
  }
  gastosFornecedores: {
    totalGastoFornecedores: number
    gastoMedioFornecedor: number
    top10Gastos: Array<{
      fornecedorId: string
      nomeFornecedor: string
      avaliacao: number
      valorTotalGasto: number
      quantidadeOrcamentos: number
      ticketMedio: number
      ultimoOrcamento: string
      percentual: number
    }>
    fornecedorMaiorGasto: string
    valorMaiorGasto: number
  }
  estatisticasGerais: {
    totalFornecedores: number
    fornecedoresAtivos: number
    fornecedoresInativos: number
    avaliacaoMediaGeral: number
    tempoMedioContrato: number
  }
  ultimaAtualizacao: string
}

export interface DashboardFilters {
  dataInicio?: string
  dataFim?: string
  secoes?: string[]
  obraIds?: string[]
  fornecedorIds?: string[]
  incluirInativos?: boolean
}

// NOTE: Este service layer não está sendo usado no dashboard atual.
// O dashboard usa Server Actions diretamente em app/actions/dashboard.ts
// Mantendo apenas os tipos para referência.
