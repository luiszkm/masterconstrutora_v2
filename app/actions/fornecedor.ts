"use server"

import { revalidatePath } from "next/cache"

// Tipos
export interface MaterialTipo {
  id: number
  nome: string
}

export interface Fornecedor {
  ID: string;
  Nome: string;
  CNPJ: string;
  Categorias: categoria[]; 
  Contato: string;
  Email: string;
  Status: string;
  Website: string | null;
  Endereco: string;
  NomeAtendente: string | null;
  Avaliacao: number;
  Observacoes: string;
  orcamentosCount: number;
}

type categoria ={
  id: string
  nome: string
}

// Dados mockados
const fornecedoresMock: Fornecedor[] = [
  {
    id: 1,
    nome: "Materiais Premium Ltda",
    cnpj: "12.345.678/0001-90",
    categoria: "Materiais de Construção",
    website: "www.materiaispremium.com.br",
    endereco: "Av. Industrial, 1500",
    cidade: "São Paulo",
    estado: "SP",
    cep: "04000-000",
    contato: "Carlos Rodrigues",
    cargo: "Gerente Comercial",
    email: "carlos@materiaispremium.com.br",
    telefone: "(11) 98765-4321",
    status: "Ativo",
    avaliacao: 5,
    orcamentos: 8,
    observacoes: "Fornecedor de materiais de construção de alta qualidade. Parceria desde 2015.",
    materiais: [
      { id: 1, nome: "Cimento" },
      { id: 2, nome: "Areia" },
      { id: 3, nome: "Brita" },
      { id: 4, nome: "Aço" },
      { id: 5, nome: "Tintas" },
    ],
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    nome: "Mármores & Granitos SA",
    cnpj: "23.456.789/0001-01",
    categoria: "Acabamentos",
    website: "www.marmoresgranitos.com.br",
    endereco: "Rua das Pedras, 800",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05000-000",
    contato: "Fernanda Lima",
    cargo: "Diretora Comercial",
    email: "fernanda@marmoresgranitos.com.br",
    telefone: "(11) 91234-5678",
    status: "Ativo",
    avaliacao: 4.5,
    orcamentos: 5,
    observacoes: "Especializada em acabamentos premium. Excelente qualidade.",
    materiais: [
      { id: 6, nome: "Mármores" },
      { id: 7, nome: "Granitos" },
      { id: 8, nome: "Porcelanatos" },
    ],
    createdAt: "2023-02-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: 3,
    nome: "Elétrica Total",
    cnpj: "34.567.890/0001-12",
    categoria: "Instalações Elétricas",
    website: "www.eletricatotal.com.br",
    endereco: "Av. Elétrica, 300",
    cidade: "São Paulo",
    estado: "SP",
    cep: "06000-000",
    contato: "Roberto Alves",
    cargo: "Supervisor Técnico",
    email: "roberto@eletricatotal.com.br",
    telefone: "(11) 97777-8888",
    status: "Inativo",
    avaliacao: 3,
    orcamentos: 2,
    observacoes: "Fornecedor de materiais elétricos. Atualmente inativo.",
    materiais: [
      { id: 9, nome: "Cabos" },
      { id: 10, nome: "Disjuntores" },
      { id: 11, nome: "Quadros Elétricos" },
    ],
    createdAt: "2023-03-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: 4,
    nome: "Hidráulica Express",
    cnpj: "45.678.901/0001-23",
    categoria: "Instalações Hidráulicas",
    website: "www.hidraulicaexpress.com.br",
    endereco: "Rua das Águas, 150",
    cidade: "São Paulo",
    estado: "SP",
    cep: "07000-000",
    contato: "Mariana Costa",
    cargo: "Gerente de Vendas",
    email: "mariana@hidraulicaexpress.com.br",
    telefone: "(11) 96666-7777",
    status: "Ativo",
    avaliacao: 4,
    orcamentos: 6,
    observacoes: "Especializada em instalações hidráulicas. Entrega rápida.",
    materiais: [
      { id: 12, nome: "Tubos PVC" },
      { id: 13, nome: "Conexões" },
      { id: 14, nome: "Registros" },
      { id: 15, nome: "Caixas d'água" },
    ],
    createdAt: "2023-04-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
  {
    id: 5,
    nome: "Madeiras Nobres",
    cnpj: "56.789.012/0001-34",
    categoria: "Madeiras",
    website: "www.madeirasnobles.com.br",
    endereco: "Estrada da Madeira, 2000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "08000-000",
    contato: "Paulo Mendes",
    cargo: "Proprietário",
    email: "paulo@madeirasnobles.com.br",
    telefone: "(11) 95555-6666",
    status: "Ativo",
    avaliacao: 5,
    orcamentos: 10,
    observacoes: "Fornecedor de madeiras de alta qualidade. Parceiro confiável.",
    materiais: [
      { id: 16, nome: "Madeira Maciça" },
      { id: 17, nome: "Compensados" },
      { id: 18, nome: "MDF" },
      { id: 19, nome: "Portas" },
      { id: 20, nome: "Deck" },
    ],
    createdAt: "2023-05-12T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
  },
]

// Simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Listar todos os fornecedores
export async function getFornecedores(): Promise<Fornecedor[]> {

  
}

// Buscar fornecedor por ID
export async function getFornecedorById(id: string): Promise<Fornecedor | { error: string }> {
  await delay(300)

  const fornecedor = fornecedoresMock.find((f) => f.id === Number.parseInt(id))

  if (!fornecedor) {
    return { error: "Fornecedor não encontrado" }
  }

  return fornecedor
}

// Criar novo fornecedor
export async function createFornecedor(formData: FormData) {
  await delay(1000)

  try {
    const nome = formData.get("nome") as string
    const cnpj = formData.get("cnpj") as string
    const categoria = formData.get("categoria") as string
    const website = formData.get("website") as string
    const endereco = formData.get("endereco") as string
    const cidade = formData.get("cidade") as string
    const estado = formData.get("estado") as string
    const cep = formData.get("cep") as string
    const contato = formData.get("contato") as string
    const cargo = formData.get("cargo") as string
    const email = formData.get("email") as string
    const telefone = formData.get("telefone") as string
    const observacoes = formData.get("observacoes") as string
    const materiaisJson = formData.get("materiais") as string

    // Validações básicas
    if (!nome || !cnpj || !categoria || !contato || !email || !telefone) {
      return {
        success: false,
        message: "Todos os campos obrigatórios devem ser preenchidos.",
      }
    }

    // Verificar se CNPJ já existe
    const cnpjExistente = fornecedoresMock.find((f) => f.cnpj === cnpj)
    if (cnpjExistente) {
      return {
        success: false,
        message: "CNPJ já cadastrado no sistema.",
      }
    }

    let materiais: MaterialTipo[] = []
    if (materiaisJson) {
      try {
        materiais = JSON.parse(materiaisJson)
      } catch {
        materiais = []
      }
    }

    const novoFornecedor: Fornecedor = {
      id: Math.max(...fornecedoresMock.map((f) => f.id)) + 1,
      nome,
      cnpj,
      categoria,
      website: website || "",
      endereco: endereco || "",
      cidade: cidade || "",
      estado: estado || "",
      cep: cep || "",
      contato,
      cargo: cargo || "",
      email,
      telefone,
      status: "Ativo",
      avaliacao: 0,
      orcamentos: 0,
      observacoes: observacoes || "",
      materiais,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Simular adição ao banco de dados
    fornecedoresMock.push(novoFornecedor)

    revalidatePath("/dashboard/fornecedores")

    return {
      success: true,
      message: "Fornecedor criado com sucesso!",
      fornecedor: novoFornecedor,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    }
  }
}

// Atualizar fornecedor
export async function updateFornecedor(id: string, formData: FormData) {
  await delay(1000)

  try {
    const fornecedorIndex = fornecedoresMock.findIndex((f) => f.id === Number.parseInt(id))

    if (fornecedorIndex === -1) {
      return {
        success: false,
        message: "Fornecedor não encontrado.",
      }
    }

    const nome = formData.get("nome") as string
    const cnpj = formData.get("cnpj") as string
    const categoria = formData.get("categoria") as string
    const website = formData.get("website") as string
    const endereco = formData.get("endereco") as string
    const cidade = formData.get("cidade") as string
    const estado = formData.get("estado") as string
    const cep = formData.get("cep") as string
    const contato = formData.get("contato") as string
    const cargo = formData.get("cargo") as string
    const email = formData.get("email") as string
    const telefone = formData.get("telefone") as string
    const avaliacao = Number.parseFloat(formData.get("avaliacao") as string) || 0
    const observacoes = formData.get("observacoes") as string
    const materiaisJson = formData.get("materiais") as string

    // Validações básicas
    if (!nome || !cnpj || !categoria || !contato || !email || !telefone) {
      return {
        success: false,
        message: "Todos os campos obrigatórios devem ser preenchidos.",
      }
    }

    // Verificar se CNPJ já existe em outro fornecedor
    const cnpjExistente = fornecedoresMock.find((f) => f.cnpj === cnpj && f.id !== Number.parseInt(id))
    if (cnpjExistente) {
      return {
        success: false,
        message: "CNPJ já cadastrado para outro fornecedor.",
      }
    }

    let materiais: MaterialTipo[] = []
    if (materiaisJson) {
      try {
        materiais = JSON.parse(materiaisJson)
      } catch {
        materiais = []
      }
    }

    // Atualizar fornecedor
    fornecedoresMock[fornecedorIndex] = {
      ...fornecedoresMock[fornecedorIndex],
      nome,
      cnpj,
      categoria,
      website: website || "",
      endereco: endereco || "",
      cidade: cidade || "",
      estado: estado || "",
      cep: cep || "",
      contato,
      cargo: cargo || "",
      email,
      telefone,
      avaliacao,
      observacoes: observacoes || "",
      materiais,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/dashboard/fornecedores")
    revalidatePath(`/dashboard/fornecedores/${id}`)

    return {
      success: true,
      message: "Fornecedor atualizado com sucesso!",
      fornecedor: fornecedoresMock[fornecedorIndex],
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    }
  }
}

// Deletar fornecedor
export async function deleteFornecedor(id: string) {
  await delay(800)

  try {
    const fornecedorIndex = fornecedoresMock.findIndex((f) => f.id === Number.parseInt(id))

    if (fornecedorIndex === -1) {
      return {
        success: false,
        message: "Fornecedor não encontrado.",
      }
    }

    const fornecedor = fornecedoresMock[fornecedorIndex]

    // Verificar se o fornecedor tem orçamentos ativos
    if (fornecedor.orcamentos > 0) {
      return {
        success: false,
        message: "Não é possível excluir fornecedor com orçamentos ativos.",
      }
    }

    // Remover fornecedor
    fornecedoresMock.splice(fornecedorIndex, 1)

    revalidatePath("/dashboard/fornecedores")

    return {
      success: true,
      message: "Fornecedor excluído com sucesso!",
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    }
  }
}

// Alternar status do fornecedor
export async function toggleFornecedorStatus(id: string) {
  await delay(500)

  try {
    const fornecedorIndex = fornecedoresMock.findIndex((f) => f.id === Number.parseInt(id))

    if (fornecedorIndex === -1) {
      return {
        success: false,
        message: "Fornecedor não encontrado.",
      }
    }

    const novoStatus = fornecedoresMock[fornecedorIndex].status === "Ativo" ? "Inativo" : "Ativo"

    fornecedoresMock[fornecedorIndex] = {
      ...fornecedoresMock[fornecedorIndex],
      status: novoStatus,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/dashboard/fornecedores")

    return {
      success: true,
      message: `Fornecedor ${novoStatus.toLowerCase()} com sucesso!`,
      status: novoStatus,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    }
  }
}
