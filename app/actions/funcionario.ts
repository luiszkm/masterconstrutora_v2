"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { decrypt } from "@/app/lib/session" // Assumindo que decrypt está em app/lib/session
import { removerMascaraMonetaria } from "../lib/masks"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Tipo para os dados básicos do funcionário
export type FuncionarioBase = {
  id?: string
  nome: string
  cpf?: string
  email?: string
  telefone?: string
  cargo?: string
  departamento?: string
  dataContratacao?: string
  chavePix?: string
  observacoes?: string
}

// Tipo para os dados de pagamento do funcionário (para criação/atualização)
export type FuncionarioPaymentPayload = {
  funcionarioId: string // ID do funcionário ao qual o pagamento se refere
  diaria?: number
  diasTrabalhados?: number
  valorAdicional?: number
  descontos?: number
  adiantamento?: number
  valorTotal?: number
  periodoInicio: string // Formato 'YYYY-MM-DD'
  periodoFim: string // Formato 'YYYY-MM-DD'
  obraId?: string // Novo campo para vincular o pagamento a uma obra
}

// Tipo para os dados de apontamento retornados pelo endpoint /funcionarios/apontamentos
export type FuncionarioApontamento = {
  id: string // ID do funcionário
  nome: string
  cargo: string
  departamento: string
  dataContratacao: string
  valorDiaria: number
  diasTrabalhados: number
  valorAdicional: number
  descontos: number
  adiantamento: number
  chavePix: string
  avaliacao: number | null
  statusApontamento: string
  apontamentoId: string | null // ID do apontamento de pagamento, se existir
}

// Tipo para a listagem simplificada de obras
export type ObraListItem = {
  id: string
  nome: string
  cliente: string
  status: string
}

/**
 * Função auxiliar para obter o token JWT da sessão
 * Exportada para ser usada diretamente em Server Components.
 */
export async function getJWTToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")?.value
  const payload = await decrypt(sessionCookie)

  if (!payload || !payload.jwtToken) {
    return null
  }

  return payload.jwtToken
}

/**
 * Função auxiliar para fazer requisições autenticadas
 */
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const jwtToken = await getJWTToken()

  if (!jwtToken) {
    // Se o token não for encontrado, lançamos um erro.
    // O Server Component que chama esta função deve lidar com o redirecionamento.
    throw new Error("Token de autenticação não encontrado")
  }

  const headers = {
    "Content-Type": "application/json",
    Cookie: `jwt-token=${jwtToken}`,
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })
}

/**
 * Cria um novo funcionário no backend (apenas dados básicos).
 * Retorna o ID do funcionário criado.
 */
export async function createFuncionario(prevState: any, formData: FormData) {
  const funcionarioData: FuncionarioBase = {
    nome: formData.get("nome") as string,
    cpf: formData.get("cpf") as string,
    email: formData.get("email") as string,
    telefone: formData.get("telefone") as string,
    cargo: formData.get("cargo") as string,
    departamento: formData.get("departamento") as string,
    dataContratacao: formData.get("dataContratacao") as string,
    chavePix: formData.get("chavePix") as string,
    observacoes: formData.get("observacoes") as string,
  }

  console.log("Dados do funcionário a serem criados:", funcionarioData)

  if (!funcionarioData.nome) {
    return { success: false, message: "Nome é obrigatório.", funcionarioId: null }
  }

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarios`, {
      method: "POST",
      body: JSON.stringify(funcionarioData),
    })

    if (!response.ok) {
      let errorMessage = "Erro ao criar funcionário."

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }

      return { success: false, message: errorMessage, funcionarioId: null }
    }

    revalidateTag("funcionarios")

    const result = await response.json()
    console.log("Resposta do backend ao criar funcionário:", result)

    const funcionarioId = result.id || result.ID || result.funcionarioId || null

    if (!funcionarioId) {
      console.error("ID do funcionário não encontrado na resposta do backend:", result)
      return { success: false, message: "ID do funcionário não recebido do servidor.", funcionarioId: null }
    }

    return {
      success: true,
      message: result.message || "Funcionário criado com sucesso!",
      funcionarioId: funcionarioId,
    }
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      // Não redirecionamos aqui, o Server Component pai fará isso.
      return { success: false, message: "Não autorizado. Faça login novamente.", funcionarioId: null }
    }

    return { success: false, message: "Erro de conexão com o servidor. Tente novamente.", funcionarioId: null }
  }
}

/**
 * Cria ou atualiza as informações de pagamento para um funcionário existente.
 * Usa POST para criar e PUT para atualizar.
 */
export async function createFuncionarioPayment(prevState: any, formData: FormData) {
  const funcionarioId = formData.get("funcionarioId") as string
  const apontamentoId = formData.get("apontamentoId") as string | null // Pode ser nulo para criação

  console.log("ID do funcionário:", funcionarioId)
  console.log("ID do apontamento (se existir):", apontamentoId)
  console.log("Dados do formulário:", Object.fromEntries(formData.entries()))


  const paymentData: FuncionarioPaymentPayload = {
    funcionarioId: funcionarioId,
    diaria: removerMascaraMonetaria((formData.get("diaria") as string) || "0"),
    diasTrabalhados: removerMascaraMonetaria((formData.get("diasTrabalhados") as string) || "0"),
    valorAdicional: removerMascaraMonetaria((formData.get("valorAdicional") as string) || "0"),
    descontos: removerMascaraMonetaria((formData.get("descontos") as string) || "0"),
    adiantamento: removerMascaraMonetaria((formData.get("adiantamento") as string) || "0"),
    valorTotal: removerMascaraMonetaria((formData.get("valorTotal") as string) || "0"),
    periodoInicio: formData.get("periodoInicio") as string,
    periodoFim: formData.get("periodoFim") as string,
    obraId: formData.get("obraId") as string,
  }

  console.log("Dados de pagamento do funcionário:", paymentData)

  if (!funcionarioId || !paymentData.periodoInicio || !paymentData.periodoFim) {
    return { success: false, message: "ID do funcionário e período de pagamento são obrigatórios." }
  }

  try {
    const method = apontamentoId ? "PUT" : "POST"
    const url = apontamentoId ? `${API_URL}/apontamentos/${apontamentoId}` : `${API_URL}/apontamentos`

    const response = await makeAuthenticatedRequest(url, {
      method: method,
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      let errorMessage = `Erro ao ${apontamentoId ? "atualizar" : "salvar"} informações de pagamento.`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }

      return { success: false, message: errorMessage }
    }

    revalidateTag(`funcionario-${funcionarioId}`)
    revalidateTag("funcionarios-apontamentos") // Revalida a lista principal

    const result = await response.json()
    return {
      success: true,
      message: result.message || `Informações de pagamento ${apontamentoId ? "atualizadas" : "salvas"} com sucesso!`,
    }
  } catch (error) {
    console.error(`Erro ao ${apontamentoId ? "atualizar" : "salvar"} informações de pagamento:`, error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { success: false, message: "Não autorizado. Faça login novamente." }
    }

    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Busca todos os funcionários do backend.
 * (Mantido para compatibilidade, mas a página principal usará getFuncionariosApontamentos)
 */
export async function getFuncionarios(): Promise<FuncionarioBase[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarioAttachment`, {
      method: "GET",
      next: { tags: ["funcionarios"] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar funcionários."

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }

      return { error: errorMessage }
    }

    const data: FuncionarioBase[] = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { error: "Não autorizado. Faça login novamente." }
    }

    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Busca um único funcionário pelo ID.
 */
export async function getFuncionarioById(id: string): Promise<FuncionarioBase | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarioAttachment/${id}`, {
      method: "GET",
      next: { tags: [`funcionario-${id}`] },
    })

    if (!response.ok) {
      let errorMessage = `Funcionário com ID ${id} não encontrado.`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }

      return { error: errorMessage }
    }

    const data: FuncionarioBase = await response.json()
    return data
  } catch (error) {
    console.error(`Erro ao buscar funcionário com ID ${id}:`, error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { error: "Não autorizado. Faça login novamente." }
    }

    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Atualiza um funcionário existente no backend (apenas dados básicos).
 */
export async function updateFuncionario(id: string, prevState: any, formData: FormData) {
  const funcionarioData: Partial<FuncionarioBase> = {
    nome: formData.get("nome") as string,
    cpf: formData.get("cpf") as string,
    email: formData.get("email") as string,
    telefone: formData.get("telefone") as string,
    cargo: formData.get("cargo") as string,
    departamento: formData.get("departamento") as string,
    dataContratacao: formData.get("dataContratacao") as string,
    chavePix: formData.get("chavePix") as string,
    observacoes: formData.get("observacoes") as string,
  }

  if (!id) {
    return { success: false, message: "ID do funcionário é obrigatório para atualização." }
  }

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarioAttachment/${id}`, {
      method: "PUT",
      body: JSON.stringify(funcionarioData),
    })

    if (!response.ok) {
      let errorMessage = "Erro ao atualizar funcionário."

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }

      return { success: false, message: errorMessage }
    }

    revalidateTag("funcionarios")
    revalidateTag(`funcionario-${id}`)
    revalidateTag("funcionarios-apontamentos") // Revalida a lista principal

    const result = await response.json()
    return { success: true, message: result.message || "Funcionário atualizado com sucesso!" }
  } catch (error) {
    console.error(`Erro ao atualizar funcionário com ID ${id}:`, error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { success: false, message: "Não autorizado. Faça login novamente." }
    }

    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Exclui um funcionário do backend.
 */
export async function deleteFuncionario(id: string) {
  if (!id) {
    return { success: false, message: "ID do funcionário é obrigatório para exclusão." }
  }

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarioAttachment/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      let errorMessage = "Erro ao excluir funcionário."

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }

      return { success: false, message: errorMessage }
    }

    // Comentado para evitar loops
    // revalidateTag("funcionarios")
    // revalidateTag("funcionarios-apontamentos")

    return { success: true, message: "Funcionário excluído com sucesso!" }
  } catch (error) {
    console.error(`Erro ao excluir funcionário com ID ${id}:`, error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { success: false, message: "Não autorizado. Faça login novamente." }
    }

    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Busca a lista de obras do backend.
 */
export async function getObrasList(): Promise<ObraListItem[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras`, {
      method: "GET",
      next: { tags: ["obras-list"] }, // Tag para revalidação de cache
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar lista de obras."
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }
      return { error: errorMessage }
    }

    const result = await response.json()
    if (result && Array.isArray(result.dados)) {
      return result.dados as ObraListItem[]
    } else {
      console.error("Formato inesperado da resposta da API de obras:", result)
      return { error: "Formato de dados de obras inesperado." }
    }
  } catch (error) {
    console.error("Erro ao buscar lista de obras:", error)
    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { error: "Não autorizado. Faça login novamente." }
    }
    return { error: "Erro de conexão com o servidor ao buscar obras. Tente novamente." }
  }
}

/**
 * Busca a lista de apontamentos de funcionários do backend.
 */
export async function getFuncionariosApontamentos(): Promise<FuncionarioApontamento[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarios/apontamentos`, {
      method: "GET",
      next: { tags: ["funcionarios-apontamentos"] }, // Tag para revalidação de cache
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar apontamentos de funcionários."
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        }
      }
      return { error: errorMessage }
    }

    const data: FuncionarioApontamento[] = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar apontamentos de funcionários:", error)
    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { error: "Não autorizado. Faça login novamente." }
    }
    return { error: "Erro de conexão com o servidor ao buscar apontamentos. Tente novamente." }
  }
}
