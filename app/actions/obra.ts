"use server"

import { revalidatePath } from "next/cache"
import { podeConclurEtapa } from "@/app/lib/obra-utils"

// Tipos
export type Obra = {
  id: number
  nome: string
  cliente: string
  endereco: string
  dataInicio: string
  dataFim: string
  status: "Em andamento" | "Concluída" | "Pausada"
  responsavel: string
  descricao: string
  etapas: EtapaObra[]
  orcamentos: number[]
  funcionarios: number[]
}

export type EtapaObra = {
  id: string
  nome: string
  concluida: boolean
  dataInicioPrevista?: string
  dataFimPrevista?: string
  dataInicioReal?: string
  dataFimReal?: string
}

// Dados mockados
const obrasMock: Obra[] = [
  {
    id: 1,
    nome: "Mansão Alphaville",
    cliente: "Roberto Mendes",
    endereco: "Alphaville, São Paulo - SP",
    dataInicio: "2024-03-15",
    dataFim: "2024-12-20",
    status: "Em andamento",
    responsavel: "Maria Oliveira",
    descricao: "Construção de mansão de alto padrão com 5 suítes, piscina e área de lazer.",
    etapas: [
      {
        id: "fundacoes",
        nome: "Fundações",
        concluida: true,
        dataInicioPrevista: "2024-03-15",
        dataFimPrevista: "2024-04-15",
      },
      {
        id: "estrutura",
        nome: "Estrutura",
        concluida: true,
        dataInicioPrevista: "2024-04-16",
        dataFimPrevista: "2024-06-15",
      },
      {
        id: "alvenaria",
        nome: "Alvenaria",
        concluida: false,
        dataInicioPrevista: "2024-06-16",
        dataFimPrevista: "2024-08-15",
      },
      {
        id: "instalacoes",
        nome: "Instalações",
        concluida: false,
        dataInicioPrevista: "2024-08-16",
        dataFimPrevista: "2024-10-15",
      },
      {
        id: "acabamentos",
        nome: "Acabamentos",
        concluida: false,
        dataInicioPrevista: "2024-10-16",
        dataFimPrevista: "2024-12-15",
      },
    ],
    orcamentos: [1, 2],
    funcionarios: [1, 2, 3],
  },
  {
    id: 2,
    nome: "Residência Beira-Mar",
    cliente: "Carla Oliveira",
    endereco: "Guarujá, São Paulo - SP",
    dataInicio: "2024-07-10",
    dataFim: "2024-12-15",
    status: "Em andamento",
    responsavel: "Carlos Santos",
    descricao: "Casa de praia com 4 quartos, vista para o mar e área gourmet.",
    etapas: [
      {
        id: "fundacoes",
        nome: "Fundações",
        concluida: true,
        dataInicioPrevista: "2024-07-10",
        dataFimPrevista: "2024-08-10",
      },
      {
        id: "estrutura",
        nome: "Estrutura",
        concluida: true,
        dataInicioPrevista: "2024-08-11",
        dataFimPrevista: "2024-09-10",
      },
      {
        id: "alvenaria",
        nome: "Alvenaria",
        concluida: true,
        dataInicioPrevista: "2024-09-11",
        dataFimPrevista: "2024-10-10",
      },
      {
        id: "instalacoes",
        nome: "Instalações",
        concluida: false,
        dataInicioPrevista: "2024-10-11",
        dataFimPrevista: "2024-11-10",
      },
      {
        id: "acabamentos",
        nome: "Acabamentos",
        concluida: false,
        dataInicioPrevista: "2024-11-11",
        dataFimPrevista: "2024-12-10",
      },
    ],
    orcamentos: [3, 4],
    funcionarios: [1, 4, 5],
  },
  {
    id: 3,
    nome: "Cobertura Duplex",
    cliente: "Fernando Almeida",
    endereco: "Jardins, São Paulo - SP",
    dataInicio: "2024-01-05",
    dataFim: "2024-09-30",
    status: "Concluída",
    responsavel: "Ana Pereira",
    descricao: "Reforma completa de cobertura duplex com automação residencial.",
    etapas: [
      {
        id: "fundacoes",
        nome: "Fundações",
        concluida: true,
        dataInicioPrevista: "2024-01-05",
        dataFimPrevista: "2024-02-05",
      },
      {
        id: "estrutura",
        nome: "Estrutura",
        concluida: true,
        dataInicioPrevista: "2024-02-06",
        dataFimPrevista: "2024-04-05",
      },
      {
        id: "alvenaria",
        nome: "Alvenaria",
        concluida: true,
        dataInicioPrevista: "2024-04-06",
        dataFimPrevista: "2024-06-05",
      },
      {
        id: "instalacoes",
        nome: "Instalações",
        concluida: true,
        dataInicioPrevista: "2024-06-06",
        dataFimPrevista: "2024-08-05",
      },
      {
        id: "acabamentos",
        nome: "Acabamentos",
        concluida: true,
        dataInicioPrevista: "2024-08-06",
        dataFimPrevista: "2024-09-25",
      },
    ],
    orcamentos: [5],
    funcionarios: [2, 3, 5],
  },
  {
    id: 4,
    nome: "Refúgio na Serra",
    cliente: "Juliana Martins",
    endereco: "Campos do Jordão, São Paulo - SP",
    dataInicio: "2024-02-20",
    dataFim: "2024-12-10",
    status: "Em andamento",
    responsavel: "Pedro Souza",
    descricao: "Casa de campo em estilo rústico com estrutura de madeira.",
    etapas: [
      {
        id: "fundacoes",
        nome: "Fundações",
        concluida: true,
        dataInicioPrevista: "2024-02-20",
        dataFimPrevista: "2024-03-20",
      },
      {
        id: "estrutura",
        nome: "Estrutura",
        concluida: false,
        dataInicioPrevista: "2024-03-21",
        dataFimPrevista: "2024-05-20",
      },
      {
        id: "alvenaria",
        nome: "Alvenaria",
        concluida: false,
        dataInicioPrevista: "2024-05-21",
        dataFimPrevista: "2024-07-20",
      },
      {
        id: "instalacoes",
        nome: "Instalações",
        concluida: false,
        dataInicioPrevista: "2024-07-21",
        dataFimPrevista: "2024-09-20",
      },
      {
        id: "acabamentos",
        nome: "Acabamentos",
        concluida: false,
        dataInicioPrevista: "2024-09-21",
        dataFimPrevista: "2024-12-05",
      },
    ],
    orcamentos: [6, 7],
    funcionarios: [1, 5],
  },
  {
    id: 5,
    nome: "Mansão Neoclássica",
    cliente: "Ricardo Souza",
    endereco: "Morumbi, São Paulo - SP",
    dataInicio: "2024-04-15",
    dataFim: "2025-08-25",
    status: "Em andamento",
    responsavel: "Maria Oliveira",
    descricao: "Mansão em estilo neoclássico com 6 suítes, cinema e spa.",
    etapas: [
      {
        id: "fundacoes",
        nome: "Fundações",
        concluida: true,
        dataInicioPrevista: "2024-04-15",
        dataFimPrevista: "2024-06-15",
      },
      {
        id: "estrutura",
        nome: "Estrutura",
        concluida: false,
        dataInicioPrevista: "2024-06-16",
        dataFimPrevista: "2024-10-15",
      },
      {
        id: "alvenaria",
        nome: "Alvenaria",
        concluida: false,
        dataInicioPrevista: "2024-10-16",
        dataFimPrevista: "2025-02-15",
      },
      {
        id: "instalacoes",
        nome: "Instalações",
        concluida: false,
        dataInicioPrevista: "2025-02-16",
        dataFimPrevista: "2025-05-15",
      },
      {
        id: "acabamentos",
        nome: "Acabamentos",
        concluida: false,
        dataInicioPrevista: "2025-05-16",
        dataFimPrevista: "2025-08-20",
      },
    ],
    orcamentos: [8, 9],
    funcionarios: [2, 3, 4],
  },
]

// Função para listar obras
export async function listarObras() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { success: true, data: obrasMock }
}

// Função para obter obra por ID
export async function obterObra(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const obra = obrasMock.find((o) => o.id === id)

  if (!obra) {
    return { success: false, error: "Obra não encontrada" }
  }

  return { success: true, data: obra }
}

// Criar nova obra
export async function criarObra(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const nome = formData.get("nome") as string
  const cliente = formData.get("cliente") as string
  const endereco = formData.get("endereco") as string
  const dataInicio = formData.get("dataInicio") as string
  const dataFim = formData.get("dataFim") as string
  const responsavel = formData.get("responsavel") as string
  const descricao = formData.get("descricao") as string

  // Validações
  if (!nome || !cliente || !endereco || !dataInicio || !dataFim || !responsavel) {
    return { success: false, error: "Todos os campos obrigatórios devem ser preenchidos" }
  }

  // Criar etapas padrão
  const etapasPadrao: EtapaObra[] = [
    { id: "fundacoes", nome: "Fundações", concluida: false },
    { id: "estrutura", nome: "Estrutura", concluida: false },
    { id: "alvenaria", nome: "Alvenaria", concluida: false },
    { id: "instalacoes", nome: "Instalações", concluida: false },
    { id: "acabamentos", nome: "Acabamentos", concluida: false },
  ]

  // Obter funcionários selecionados
  const funcionarios = formData.getAll("funcionarios").map((id) => Number(id))

  const novaObra: Obra = {
    id: Math.max(...obrasMock.map((o) => o.id)) + 1,
    nome,
    cliente,
    endereco,
    dataInicio,
    dataFim,
    status: "Em andamento",
    responsavel,
    descricao,
    etapas: etapasPadrao,
    orcamentos: [],
    funcionarios, // Usar funcionários selecionados
  }

  obrasMock.push(novaObra)
  revalidatePath("/dashboard/obras")

  return { success: true, data: novaObra }
}

// Atualizar obra
export async function atualizarObra(id: number, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const obraIndex = obrasMock.findIndex((o) => o.id === id)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  const nome = formData.get("nome") as string
  const cliente = formData.get("cliente") as string
  const endereco = formData.get("endereco") as string
  const dataInicio = formData.get("dataInicio") as string
  const dataFim = formData.get("dataFim") as string
  const responsavel = formData.get("responsavel") as string
  const descricao = formData.get("descricao") as string
  const status = formData.get("status") as "Em andamento" | "Concluída" | "Pausada"

  // Validações
  if (!nome || !cliente || !endereco || !dataInicio || !dataFim || !responsavel) {
    return { success: false, error: "Todos os campos obrigatórios devem ser preenchidos" }
  }

  obrasMock[obraIndex] = {
    ...obrasMock[obraIndex],
    nome,
    cliente,
    endereco,
    dataInicio,
    dataFim,
    responsavel,
    descricao,
    status,
  }

  revalidatePath("/dashboard/obras")
  return { success: true, data: obrasMock[obraIndex] }
}

// Excluir obra
export async function excluirObra(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const obraIndex = obrasMock.findIndex((o) => o.id === id)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  obrasMock.splice(obraIndex, 1)
  revalidatePath("/dashboard/obras")

  return { success: true }
}

// Concluir etapa da obra (POST para backend)
export async function concluirEtapa(obraId: number, etapaId: string) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const obraIndex = obrasMock.findIndex((o) => o.id === obraId)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  const obra = obrasMock[obraIndex]
  const etapaIndex = obra.etapas.findIndex((e) => e.id === etapaId)

  if (etapaIndex === -1) {
    return { success: false, error: "Etapa não encontrada" }
  }

  const etapa = obra.etapas[etapaIndex]

  if (etapa.concluida) {
    return { success: false, error: "Etapa já está concluída" }
  }

  // Verificar se pode concluir esta etapa
  if (!podeConclurEtapa(obra.etapas, etapaId)) {
    return { success: false, error: "Complete as etapas anteriores primeiro" }
  }

  // Marcar etapa como concluída
  obra.etapas[etapaIndex] = {
    ...etapa,
    concluida: true,
    dataFimReal: new Date().toISOString().split("T")[0],
  }

  // Verificar se todas as etapas foram concluídas
  const todasConcluidas = obra.etapas.every((e) => e.concluida)
  if (todasConcluidas) {
    obra.status = "Concluída"
  }

  // Simular POST para backend
  const postData = {
    nome: etapa.nome,
    dataInicioPrevista: etapa.dataInicioPrevista || new Date().toISOString().split("T")[0],
    dataFimPrevista: etapa.dataFimPrevista || new Date().toISOString().split("T")[0],
  }


  revalidatePath("/dashboard/obras")
  return { success: true, data: obra }
}

// Alocar funcionário à obra
export async function alocarFuncionario(obraId: number, funcionarioId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const obraIndex = obrasMock.findIndex((o) => o.id === obraId)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  const obra = obrasMock[obraIndex]

  if (obra.funcionarios.includes(funcionarioId)) {
    return { success: false, error: "Funcionário já está alocado nesta obra" }
  }

  obra.funcionarios.push(funcionarioId)
  revalidatePath("/dashboard/obras")

  return { success: true, data: obra }
}

// Desalocar funcionário da obra
export async function desalocarFuncionario(obraId: number, funcionarioId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const obraIndex = obrasMock.findIndex((o) => o.id === obraId)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  const obra = obrasMock[obraIndex]
  obra.funcionarios = obra.funcionarios.filter((id) => id !== funcionarioId)

  revalidatePath("/dashboard/obras")
  return { success: true, data: obra }
}

// Linkar orçamento à obra
export async function linkarOrcamento(obraId: number, orcamentoId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const obraIndex = obrasMock.findIndex((o) => o.id === obraId)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  const obra = obrasMock[obraIndex]

  if (obra.orcamentos.includes(orcamentoId)) {
    return { success: false, error: "Orçamento já está linkado nesta obra" }
  }

  obra.orcamentos.push(orcamentoId)
  revalidatePath("/dashboard/obras")

  return { success: true, data: obra }
}

// Deslinkar orçamento da obra
export async function deslinkarOrcamento(obraId: number, orcamentoId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const obraIndex = obrasMock.findIndex((o) => o.id === obraId)
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" }
  }

  const obra = obrasMock[obraIndex]
  obra.orcamentos = obra.orcamentos.filter((id) => id !== orcamentoId)

  revalidatePath("/dashboard/obras")
  return { success: true, data: obra }
}
