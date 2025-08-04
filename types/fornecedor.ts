// Tipo baseado no retorno real da API atualizada
export type Fornecedor = {
  // Estrutura nova (minúscula)
  id?: string
  nome?: string
  cnpj?: string
  contato?: string
  email?: string
  status?: "Ativo" | "Inativo"
  endereco?: string | null
  website?: string | null
  nomeAtendente?: string | null
  avaliacao?: number | null
  observacoes?: string | null

  // Estrutura antiga (maiúscula) - para compatibilidade
  ID?: string
  Nome?: string
  CNPJ?: string
  Contato?: string
  Email?: string
  Status?: "Ativo" | "Inativo"
  Endereco?: string | null
  Website?: string | null
  NomeAtendente?: string | null
  Avaliacao?: number | null
  Observacoes?: string | null

  // Categorias (ambas as estruturas)
  categorias?: {
    ID: string
    Nome: string
    createdAt: string
    updatedAt: string
  }[]
  Categorias?: {
    ID: string
    Nome: string
    createdAt: string
    updatedAt: string
  }[]

  orcamentosCount: number
}

// Tipo para a API de orçamentos (estrutura real da API)
export type FornecedorOrcamento = {
  id: string
  nome: string
  cnpj: string
  contato?: string
  email?: string
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
