// Tipos baseados na estrutura real da API atualizada
export type ItemOrcamento = {
  id: string
  orcamentoId: string
  produtoId: string
  quantidade: number
  valorUnitario: number
}

export type Orcamento = {
  id: string
  numero: string
  valorTotal: number
  status: "Em Aberto" | "Aprovado" | "Rejeitado" | "Cancelado"
  dataEmissao: string
  obraId: string
  obraNome: string
  fornecedorId: string
  fornecedorNome: string
  itensCount: number
}

// Tipos para resposta da API
export type OrcamentosResponse = {
  dados: Orcamento[]
  paginacao: {
    totalItens: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

// Tipo para item do orçamento detalhado (estrutura real da API)
export type ItemOrcamentoDetalhado = {
  ProdutoNome: string
  UnidadeDeMedida: string
  Categoria: string
  Quantidade: number
  ValorUnitario: number
}

// Tipo para orçamento detalhado (estrutura real da API)
export type OrcamentoDetalhado = {
  id: string
  numero: string
  valorTotal: number
  status: "Em Aberto" | "Aprovado" | "Rejeitado" | "Cancelado"
  dataEmissao: string
  obra: {
    id: string
    nome: string
  }
  etapa: {
    id: string
    nome: string
  }
  fornecedor: {
    id: string
    nome: string
  }
  itens: ItemOrcamentoDetalhado[]
}

// Tipos expandidos para exibição (com dados relacionados)
export type OrcamentoExpandido = Orcamento & {
  fornecedor?: {
    id: string
    nome: string
    cnpj: string
    status: string
  }
  obra?: {
    id: string
    nome: string
    cliente: string
  }
  itensDetalhados?: (ItemOrcamento & {
    produto?: {
      id: string
      nome: string
      categoria: string
      unidadeMedida: string
    }
  })[]
}
