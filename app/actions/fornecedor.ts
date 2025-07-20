"use server"

import { revalidatePath } from "next/cache"
import { API_URL, makeAuthenticatedRequest } from "./common"
import type { Fornecedor, CreateFornecedor } from "@/types/fornecedor"

// Tipo para categoria da API
type Categoria = {
  ID: string
  Nome: string
  createdAt: string
  updatedAt: string
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

    const data: Categoria[] = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getFornecedores(): Promise<Fornecedor[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores`, {
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

    const data: Fornecedor[] = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { error: "Não autorizado. Faça login novamente." }
    }

    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function getFornecedorById(id: string): Promise<Fornecedor | null> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores/${id}`, {
      method: "GET",
    })

    if (!response.ok) {
      return null
    }

    const data: Fornecedor = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error)
    return null
  }
}

export async function createFornecedor(data: CreateFornecedor): Promise<{
  success: boolean
  message: string
  fornecedor?: Fornecedor
}> {
  try {
    // Validações básicas
    if (!data.Nome || !data.Email || !data.Contato) {
      return {
        success: false,
        message: "Nome, email e contato são obrigatórios",
      }
    }

    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores`, {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Erro ao criar fornecedor",
      }
    }

    const fornecedor: Fornecedor = await response.json()

    // Revalidar cache da página
    revalidatePath("/dashboard/fornecedores")

    return {
      success: true,
      message: "Fornecedor criado com sucesso",
      fornecedor,
    }
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error)
    return {
      success: false,
      message: "Erro interno do servidor",
    }
  }
}

export async function updateFornecedor(
  id: string,
  data: Partial<CreateFornecedor>,
): Promise<{
  success: boolean
  message: string
  fornecedor?: Fornecedor
}> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Erro ao atualizar fornecedor",
      }
    }

    const fornecedor: Fornecedor = await response.json()

    revalidatePath("/dashboard/fornecedores")
    revalidatePath(`/dashboard/fornecedores/${id}`)

    return {
      success: true,
      message: "Fornecedor atualizado com sucesso",
      fornecedor,
    }
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error)
    return {
      success: false,
      message: "Erro interno do servidor",
    }
  }
}

export async function deleteFornecedor(id: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Erro ao excluir fornecedor",
      }
    }

    revalidatePath("/dashboard/fornecedores")

    return {
      success: true,
      message: "Fornecedor excluído com sucesso",
    }
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error)
    return {
      success: false,
      message: "Erro interno do servidor",
    }
  }
}

export async function toggleFornecedorStatus(id: string): Promise<{
  success: boolean
  message: string
  status?: "Ativo" | "Inativo"
}> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/fornecedores/${id}/toggle-status`, {
      method: "PATCH",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Erro ao alterar status",
      }
    }

    const result = await response.json()

    revalidatePath("/dashboard/fornecedores")

    return {
      success: true,
      message: `Fornecedor ${result.status.toLowerCase()} com sucesso`,
      status: result.status,
    }
  } catch (error) {
    console.error("Erro ao alterar status do fornecedor:", error)
    return {
      success: false,
      message: "Erro interno do servidor",
    }
  }
}
