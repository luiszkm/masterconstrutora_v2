// Tipo baseado no retorno real da API
export type Fornecedor = {
  ID: string
  Nome: string
  CNPJ: string
  Categorias: {
    ID: string
    Nome: string
    createdAt: string
    updatedAt: string
  }[]
  Contato: string
  Email: string
  Status: "Ativo" | "Inativo"
  Website: string | null
  Endereco: string | null
  NomeAtendente: string | null
  Avaliacao: number | null
  Observacoes: string | null
  orcamentosCount: number
}

export type FornecedorOrcamento = {
  id: string
  nome: string
  cnpj: string
  contato: string
  email: string
  status: "Ativo" | "Inativo"
  endereco: string | null
  avaliacao: number | null
  observacoes: string | null
  categorias: {
    ID: string
    Nome: string
    createdAt: string
    updatedAt: string
  }[]
  orcamentosCount: number
}
export type CreateFornecedor = {
  Nome: string
  Contato: string
  Email: string
  CNPJ: string
  Avaliacao?: number | null
  Observacoes?: string
  Website?: string
  Endereco?: string
  NomeAtendente?: string
  categoriaIds: string[]
}
