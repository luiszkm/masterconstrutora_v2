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

// Funcionário - Conforme documentação oficial da API
export interface Funcionario {
  id: string
  nome: string
  cpf: string
  telefone: string
  cargo: string
  email?: string
  departamento: string
  dataContratacao: string
  valorDiaria?: number // Optional since backend doesn't always return this
  chavePix: string
  status: "Ativo" | "Inativo" | "Desligado" | "ATIVO" | "INATIVO" | "DESLIGADO" // Support both formats
  desligamentoData?: string
  motivoDesligamento?: string
  created_at: string
  updated_at: string
  diaria?: number // Optional since backend doesn't always return this
  avaliacaoDesempenho?: string
  observacoes?: string
}

// Payload para criar funcionário
export interface CriarFuncionarioRequest {
  nome: string
  cpf: string
  cargo: string
  departamento: string
  diaria: number
  chavePix: string
  observacoes?: string
  telefone: string
}

// Payload para atualizar funcionário
export interface AtualizarFuncionarioRequest {
  nome?: string
  cpf?: string
  cargo?: string
  departamento?: string
  valorDiaria?: number
  chavePix?: string
  status?: "ATIVO" | "INATIVO" | "DESLIGADO"
  telefone?: string
  motivoDesligamento?: string
  dataContratacao?: string
  desligamentoData?: string
  observacoes?: string
  avaliacaoDesempenho?: string
  email?: string
}

// Funcionário com último apontamento
export interface FuncionarioComUltimoApontamento {
  // Employee basic info
  id: string
  nome: string
  cpf: string
  telefone: string
  cargo: string
  email?: string
  departamento: string
  dataContratacao: string
  chavePix: string
  status: "Ativo" | "Inativo" | "Desligado" | "ATIVO" | "INATIVO" | "DESLIGADO"
  motivoDesligamento?: string
  created_at: string
  updated_at: string
  avaliacaoDesempenho?: string
  observacoes?: string

  // Apontamento data (when available)
  apontamentoId?: string | null
  valorDiaria: number
  diasTrabalhados: number
  valorAdicional: number
  descontos: number
  adiantamento: number
  periodoInicio?: string
  periodoFim?: string
  obraId?: string
  statusApontamento?: "EM_ABERTO" | "APROVADO_PARA_PAGAMENTO" | "PAGO" | "CANCELADO"

  // Legacy support
  funcionarioId?: string
  funcionarioNome?: string
  ultimoApontamento?: ApontamentoQuinzenal
}

// Apontamento Quinzenal - Conforme documentação oficial da API
export interface ApontamentoQuinzenal {
  id: string
  funcionarioId: string
  obraId: string
  periodoInicio: string
  periodoFim: string
  diaria: number
  diasTrabalhados: number
  adicionais: number
  descontos: number
  adiantamentos: number
  valorTotalCalculado: number
  status: "EM_ABERTO" | "APROVADO_PARA_PAGAMENTO" | "PAGO" | "CANCELADO"
  createdAt: string
  updatedAt: string
  funcionarioNome: string
}

// Payload para criar apontamento
export interface CriarApontamentoRequest {
  FuncionarioID: string
  ObraID: string
  PeriodoInicio: string // "YYYY-MM-DD"
  PeriodoFim: string // "YYYY-MM-DD"
  Diaria: number
  DiasTrabalhados: number
  ValorAdicional: number
  Descontos: number
  Adiantamento: number
}

// Payload para atualizar apontamento
export interface AtualizarApontamentoRequest {
  funcionarioId: string
  obraId: string
  periodoInicio: string // "YYYY-MM-DD"
  periodoFim: string // "YYYY-MM-DD"
  diaria: number
  diasTrabalhados: number
  valorAdicional: number
  descontos: number
  adiantamento: number
  status: "EM_ABERTO" | "APROVADO_PARA_PAGAMENTO" | "PAGO" | "CANCELADO"
}

// Payload para replicar apontamentos
export interface ReplicarApontamentosRequest {
  funcionarioIds: string[]
}

// Resposta da replicação de apontamentos
export interface ReplicarApontamentosResponse {
  resumo: {
    totalSolicitado: number
    totalSucesso: number
    totalFalha: number
  }
  sucessos: {
    funcionarioId: string
    novoApontamentoId: string
  }[]
  falhas: {
    funcionarioId: string
    motivo: string
  }[]
}

// Padrão de paginação compatível com o backend
export interface BackendPaginatedResponse<T> {
  dados: T[]
  paginacao: {
    totalItens: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

// Resposta paginada de apontamentos (usando padrão backend)
export type ApontamentosPaginatedResponse = BackendPaginatedResponse<ApontamentoQuinzenal>

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

// Paginação (DEPRECATED - usar BackendPaginatedResponse)
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Cronograma de Recebimento
export interface CronogramaRecebimento {
  id: string
  obraId: string
  numeroEtapa: number
  descricaoEtapa: string
  valorPrevisto: number
  valorRecebido: number
  valorSaldo: number
  dataVencimento: string
  dataRecebimento?: string
  status: "PENDENTE" | "RECEBIDO" | "VENCIDO"
  percentualRecebido: number
  estaVencido: boolean
}

export interface CriarCronogramaRequest {
  obraId: string
  numeroEtapa: number
  descricaoEtapa: string
  valorPrevisto: number
  dataVencimento: string
}

export interface CriarCronogramaLoteRequest {
  obraId: string
  substituirExistente: boolean
  cronogramas: Omit<CriarCronogramaRequest, "obraId">[]
}

// Comparação de Orçamentos
export interface OrcamentoComparacao {
  id: string
  numero: string
  valorTotal: number
  status: string
  dataEmissao: string
  obraId: string
  obraNome: string
  fornecedorId: string
  fornecedorNome: string
  itensCount: number
  categorias: {
    ID: string
    Nome: string
  }[]
}

export interface ComparacaoOrcamentosResponse {
  categoria: string
  descripcion: string
  orcamentos: OrcamentoComparacao[]
  total: number
}

// Filtros (atualizado para usar pageSize em vez de limit)
export interface FilterOptions {
  page?: number
  pageSize?: number
  sort?: string
  order?: "asc" | "desc"
  search?: string
  [key: string]: any
}


export interface Categoria {
  ID: number | string
  Nome: string
}

// Etapas da Obra - Conforme API real
export interface EtapaAPI {
  ID: string
  ObraID: string
  Nome: string
  data_inicio_prevista: string
  data_fim_prevista: string
  Status: "Completa" | "Em Andamento" | "Pendente"
}

export interface EtapasResponse {
  dados: EtapaAPI[]
  paginacao: {
    totalItens: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

// Payload para atualizar status da etapa
export interface AtualizarEtapaRequest {
  status: "Completa" | "Em Andamento" | "Pendente"
  dataInicioReal?: string
  dataFimReal?: string
}
