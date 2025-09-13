"use server"

import { revalidatePath } from "next/cache"
import { API_URL, makeAuthenticatedRequest } from "./common"
import type { OrcamentosResponse, OrcamentoDetalhado } from "@/types/orcamento"
import type { FornecedorOrcamento } from "@/types/fornecedor"
import { validateFormData } from "@/lib/validations/common"
import { createOrcamentoSchema, updateOrcamentoSchema, aprovarOrcamentoSchema } from "@/lib/validations/orcamento"
import { createSuccessResponse, createErrorResponse, type CreateActionResponse, type ActionResponse } from "@/types/action-responses"

// Tipo para categoria da API
type Categoria = {
  ID: string
  Nome: string
  createdAt: string
  updatedAt: string
}

// Tipo para obra da API (estrutura real)
type Obra = {
  id: string
  nome: string
  cliente: string
  status: string
  etapa: string
  evolucao: string
}

// Tipo para resposta da API de obras
type ObrasResponse = {
  dados: Obra[]
  paginacao: {
    totalItens: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

// Tipo para etapa da API
type Etapa = {
  ID: string
  Nome: string
  // outros campos da etapa se necessário
}

// Tipo para criar orçamento baseado no payload da API
type CreateOrcamentoData = {
  fornecedorId: string
  itens: {
    nomeProduto: string
    unidadeDeMedida: string
    categoria: string
    quantidade: number
    valorUnitario: number
  }[]
  condicoesPagamento: string
  observacoes?: string
}

// Tipo para atualizar orçamento baseado no payload da API
type UpdateOrcamentoData = {
  fornecedorId: string
  etapaId: string
  observacoes?: string
  condicoesPagamento: string
  itens: {
    nomeProduto: string
    unidadeDeMedida: string
    categoria: string
    quantidade: number
    valorUnitario: number
  }[]
}

// Atualizar a função getOrcamentos para trabalhar com paginação
export async function getOrcamentos(page = 1, pageSize = 20): Promise<OrcamentosResponse | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/orcamentos?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      next: { tags: ["orcamentos"] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar orçamentos."

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

    const responseData: OrcamentosResponse = await response.json()
    return responseData
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getOrcamentoById(id: string): Promise<OrcamentoDetalhado | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/orcamentos/${id}`, {
      method: "GET",
      next: { tags: ["orcamento", id] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar orçamento."

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        } else if (response.status === 404) {
          errorMessage = "Orçamento não encontrado."
        }
      }

      return { error: errorMessage }
    }

    const data: OrcamentoDetalhado = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getObras(): Promise<Obra[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras`, {
      method: "GET",
      next: { tags: ["obras"] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar obras."

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

    const responseData: ObrasResponse = await response.json()
    return responseData.dados
  } catch (error) {
    console.error("Erro ao buscar obras:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getEtapasByObra(obraId: string): Promise<Etapa[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras/${obraId}/etapas`, {
      method: "GET",
      next: { tags: ["etapas", `obra-${obraId}`] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar etapas."

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
    // Handle paginated response structure
    const data: Etapa[] = result.dados || result || []
    return data
  } catch (error) {
    console.error("Erro ao buscar etapas:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

// Função atualizada para trabalhar com a estrutura real da API de fornecedores
export async function getFornecedores(): Promise<FornecedorOrcamento[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores?pageSize=1000`, {
      method: "GET",
      next: { tags: ["fornecedores"] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar fornecedores."

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
    // Handle paginated response structure
    const data: FornecedorOrcamento[] = result.dados || result || []
    return data
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getCategorias(): Promise<Categoria[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/categorias`, {
      method: "GET",
      next: { tags: ["categorias"] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar categorias."

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
    // Handle paginated response structure
    const data: Categoria[] = result.dados || result || []
    return data
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function createOrcamento(
  etapaId: string,
  data: CreateOrcamentoData,
): Promise<CreateActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/etapas/${etapaId}/orcamentos`, {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return createErrorResponse(errorData.message || "Erro ao criar orçamento")
    }

    const orcamento = await response.json()

    // Revalidar cache das páginas relacionadas
    revalidatePath("/dashboard/orcamentos")
    revalidatePath(`/dashboard/etapas/${etapaId}`)

    return createSuccessResponse("Orçamento criado com sucesso", orcamento)
  } catch (error) {
    console.error("Erro ao criar orçamento:", error)
    return createErrorResponse("Erro interno do servidor")
  }
}

export async function updateOrcamento(
  id: string,
  data: UpdateOrcamentoData,
): Promise<ActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/orcamentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return createErrorResponse(errorData.message || "Erro ao atualizar orçamento")
    }

    const orcamento = await response.json()

    // Revalidar cache das páginas relacionadas
    revalidatePath("/dashboard/orcamentos")
    revalidatePath(`/dashboard/orcamentos/${id}`)

    return createSuccessResponse("Orçamento atualizado com sucesso", orcamento)
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error)
    return createErrorResponse("Erro interno do servidor")
  }
}

export async function deleteOrcamento(id: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/orcamentos/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Erro ao excluir orçamento",
      }
    }

    revalidatePath("/dashboard/orcamentos")

    return {
      success: true,
      message: "Orçamento excluído com sucesso",
    }
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error)
    return {
      success: false,
      message: "Erro interno do servidor",
    }
  }
}

export async function updateOrcamentoStatus(
  id: string,
  status: "Em Aberto" | "Aprovado" | "Rejeitado" | "Cancelado",
): Promise<ActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/orcamentos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return createErrorResponse(errorData.message || "Erro ao atualizar status")
    }

    revalidatePath("/dashboard/orcamentos")

    return createSuccessResponse("Status atualizado com sucesso")
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return createErrorResponse("Erro interno do servidor")
  }
}

export async function getOrcamentosByFornecedor(
  fornecedorId: string,
  page = 1,
  pageSize = 20,
): Promise<OrcamentosResponse | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/orcamentos?fornecedorId=${fornecedorId}&page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        next: { tags: ["orcamentos", `fornecedor-${fornecedorId}`] },
      },
    )

    if (!response.ok) {
      let errorMessage = "Erro ao buscar orçamentos do fornecedor."

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente."
        } else if (response.status === 404) {
          errorMessage = "Fornecedor não encontrado."
        }
      }

      return { error: errorMessage }
    }

    const responseData: OrcamentosResponse = await response.json()
    return responseData
  } catch (error) {
    console.error("Erro ao buscar orçamentos do fornecedor:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}
