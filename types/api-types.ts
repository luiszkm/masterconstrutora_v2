/**
 * Tipos para as entidades da API
 */

// Usuário
export interface User {
  id: string
  nome: string
  email: string
  cargo: string
  avatar?: string
  dataCriacao: string
  ultimoAcesso?: string
  status: "ativo" | "inativo"
  permissoes: string[]
}

// Funcionário
export interface Funcionario {
  id: string
  nome: string
  cargo: string
  departamento: string
  dataContratacao: string
  salario: number
  status: "ativo" | "afastado" | "ferias" | "desligado"
  telefone: string
  email: string
  endereco: string
  documentos: {
    cpf: string
    rg?: string
    ctps?: string
  }
  dadosBancarios: {
    banco: string
    agencia: string
    conta: string
    tipoConta: "corrente" | "poupanca"
  }
  avatar?: string
  observacoes?: string
}

// Pagamento de Funcionário
export interface PagamentoFuncionario {
  id: string
  funcionarioId: string
  valor: number
  data: string
  status: "pendente" | "pago" | "cancelado"
  comprovante?: string
  descricao?: string
  tipo: "salario" | "bonus" | "adiantamento" | "ferias" | "decimo_terceiro" | "outros"
  referencia: {
    mes: number
    ano: number
  }
}

// Fornecedor
export interface Fornecedor {
  id: string
  nome: string
  tipo: string
  cnpj: string
  telefone: string
  email: string
  endereco: string
  contato: string
  avaliacao?: number
  status: "ativo" | "inativo"
  dataCadastro: string
  dadosBancarios?: {
    banco: string
    agencia: string
    conta: string
    tipoConta: "corrente" | "poupanca"
  }
  observacoes?: string
}

// Material
export interface Material {
  id: string
  nome: string
  categoria: string
  unidade: string
  preco: number
  estoque: number
  estoqueMinimo: number
  fornecedorId?: string
  dataCadastro: string
  ultimaAtualizacao: string
  descricao?: string
  imagem?: string
  status: "disponivel" | "baixo_estoque" | "sem_estoque" | "descontinuado"
  localizacao?: string
}

// Obra
export interface Obra {
  id: string
  nome: string
  tipo: string
  endereco: string
  dataInicio: string
  dataPrevisaoTermino: string
  dataTermino?: string
  status: "planejamento" | "em_andamento" | "pausada" | "concluida" | "cancelada"
  orcamento: number
  valorGasto: number
  progresso: number
  clienteId: string
  responsavelId: string
  descricao?: string
  imagens?: string[]
  documentos?: {
    id: string
    nome: string
    url: string
    tipo: string
    dataCriacao: string
  }[]
}

// Orçamento
export interface Orcamento {
  id: string
  titulo: string
  fornecedorId: string
  obraId?: string
  valor: number
  dataCriacao: string
  dataValidade: string
  status: "pendente" | "aprovado" | "rejeitado" | "vencido" | "pago"
  itens: {
    id: string
    descricao: string
    quantidade: number
    valorUnitario: number
    valorTotal: number
  }[]
  observacoes?: string
  arquivos?: string[]
  aprovadoPor?: string
  dataPagamento?: string
  comprovantePagamento?: string
}

// Cliente
export interface Cliente {
  id: string
  nome: string
  tipo: "pessoa_fisica" | "pessoa_juridica"
  documento: string
  telefone: string
  email: string
  endereco: string
  dataCadastro: string
  status: "ativo" | "inativo"
  observacoes?: string
}

// Paginação
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filtros
export interface FilterOptions {
  page?: number
  limit?: number
  sort?: string
  order?: "asc" | "desc"
  search?: string
  [key: string]: any
}
