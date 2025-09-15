"use server"

import { revalidateTag } from "next/cache"
import { funcionariosService } from "@/services/funcionarios-service"
import { createSuccessResponse, createErrorResponse, type ActionResponse } from "@/types/action-responses"
import { validateFormData } from "@/lib/validations/common"
import { 
  criarFuncionarioSchema, 
  atualizarFuncionarioSchema,
  funcionarioIdSchema,
  funcionariosQuerySchema,
  type CriarFuncionarioData,
  type AtualizarFuncionarioData
} from "@/lib/validations/funcionario"
import type { 
  Funcionario, 
  FuncionarioComUltimoApontamento, 
  ApontamentosPaginatedResponse,
  BackendPaginatedResponse,
  FilterOptions
} from "@/types/api-types"
import type { FuncionariosResponse } from "@/types/funcionario"

/**
 * 1. Cadastrar Funcionário
 * Action conforme documentação oficial da API Pessoal
 */
export async function criarFuncionarioAction(
  prevState: any, 
  formData: FormData
): Promise<ActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, criarFuncionarioSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  try {
    const funcionario = await funcionariosService.criarFuncionario(validation.data)
    
    // Revalidar cache
    revalidateTag("funcionarios")
    revalidateTag("funcionarios-apontamentos")
    
    return createSuccessResponse(
      "Funcionário criado com sucesso!",
      { id: funcionario.id }
    )
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)
    
    if (error instanceof Error) {
      // Mapear erros específicos da API
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      if (error.message.includes("CPF já cadastrado")) {
        return createErrorResponse("CPF já cadastrado no sistema.")
      }
      return createErrorResponse(error.message)
    }
    
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * 2. Listar Funcionários
 */
export async function listarFuncionariosAction(
  searchParams?: { page?: string; pageSize?: string; search?: string }
): Promise<BackendPaginatedResponse<Funcionario> | { error: string }> {
  try {
    // Converter parâmetros de string para objeto de filtros
    const filtros: FilterOptions = {}
    if (searchParams?.page) filtros.page = parseInt(searchParams.page)
    if (searchParams?.pageSize) filtros.pageSize = parseInt(searchParams.pageSize)
    if (searchParams?.search) filtros.search = searchParams.search
    
    const funcionarios = await funcionariosService.listarFuncionarios(filtros)
    return funcionarios
  } catch (error) {
    console.error("Erro ao listar funcionários:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("Token de autenticação")) {
        return { error: "Não autorizado. Faça login novamente." }
      }
      return { error: error.message }
    }
    
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * 3. Buscar Funcionário por ID
 */
export async function obterFuncionarioAction(
  funcionarioId: string
): Promise<Funcionario | { error: string }> {
  try {
    // Validar ID
    const validation = funcionarioIdSchema.safeParse({ funcionarioId })
    if (!validation.success) {
      return { error: "ID de funcionário inválido" }
    }
    
    const funcionario = await funcionariosService.obterFuncionario(funcionarioId)
    return funcionario
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return { error: "Funcionário não encontrado" }
      }
      if (error.message.includes("Token de autenticação")) {
        return { error: "Não autorizado. Faça login novamente." }
      }
      return { error: error.message }
    }
    
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * 4. Atualizar Funcionário
 */
export async function atualizarFuncionarioAction(
  funcionarioId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, atualizarFuncionarioSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }

  try {
    // Validar ID
    const idValidation = funcionarioIdSchema.safeParse({ funcionarioId })
    if (!idValidation.success) {
      return createErrorResponse("ID de funcionário inválido")
    }
    
    const funcionario = await funcionariosService.atualizarFuncionario(funcionarioId, validation.data)
    
    // Revalidar cache
    revalidateTag("funcionarios")
    revalidateTag("funcionarios-apontamentos")
    revalidateTag(`funcionario-${funcionarioId}`)
    
    return createSuccessResponse("Funcionário atualizado com sucesso!", funcionario)
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Funcionário não encontrado")
      }
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      return createErrorResponse(error.message)
    }
    
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * 5. Ativar Funcionário
 */
export async function ativarFuncionarioAction(funcionarioId: string): Promise<ActionResponse> {
  try {
    // Validar ID
    const validation = funcionarioIdSchema.safeParse({ funcionarioId })
    if (!validation.success) {
      return createErrorResponse("ID de funcionário inválido")
    }
    
    await funcionariosService.ativarFuncionario(funcionarioId)
    
    // Revalidar cache
    revalidateTag("funcionarios")
    revalidateTag("funcionarios-apontamentos")
    revalidateTag(`funcionario-${funcionarioId}`)
    
    return createSuccessResponse("Funcionário ativado com sucesso!")
  } catch (error) {
    console.error("Erro ao ativar funcionário:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Funcionário não encontrado")
      }
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      return createErrorResponse(error.message)
    }
    
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * 6. Deletar Funcionário
 */
export async function removerFuncionarioAction(funcionarioId: string): Promise<ActionResponse> {
  try {
    // Validar ID
    const validation = funcionarioIdSchema.safeParse({ funcionarioId })
    if (!validation.success) {
      return createErrorResponse("ID de funcionário inválido")
    }
    
    await funcionariosService.removerFuncionario(funcionarioId)
    
    // Revalidar cache
    revalidateTag("funcionarios")
    revalidateTag("funcionarios-apontamentos")
    
    return createSuccessResponse("Funcionário removido com sucesso!")
  } catch (error) {
    console.error("Erro ao remover funcionário:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Funcionário não encontrado")
      }
      if (error.message.includes("possui alocações ativas")) {
        return createErrorResponse("Funcionário não pode ser removido pois possui alocações ativas")
      }
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      return createErrorResponse(error.message)
    }
    
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * 7. Listar Funcionários com Último Apontamento
 */
export async function listarFuncionariosComUltimoApontamentoAction(
  searchParams?: { page?: string; pageSize?: string; status?: string; dataInicio?: string; dataFim?: string }
): Promise<FuncionariosResponse | { error: string }> {
  try {
    // Validar parâmetros de query
    const params = searchParams ? {
      page: searchParams.page,
      pageSize: searchParams.pageSize,
      status: searchParams.status,
      dataInicio: searchParams.dataInicio,
      dataFim: searchParams.dataFim
    } : undefined
    
    const validation = funcionariosQuerySchema.safeParse(params || {})
    if (!validation.success) {
      return { error: "Parâmetros de consulta inválidos" }
    }
    
    const response = await funcionariosService.listarFuncionariosComUltimoApontamento(validation.data)

    // Log the response structure for debugging
    console.log('API Response structure:', {
      hasResponse: !!response,
      hasDados: !!(response?.dados),
      responseKeys: response ? Object.keys(response) : [],
      responseType: typeof response,
      isArray: Array.isArray(response)
    })

    // Handle different response structures
    let funcionarios = []
    let paginacao = {
      totalItens: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 20
    }

    if (response) {
      if (response.dados && Array.isArray(response.dados)) {
        // Standard paginated response
        funcionarios = response.dados
        paginacao = response.paginacao || paginacao
      } else if (Array.isArray(response)) {
        // Direct array response
        funcionarios = response
        paginacao = {
          totalItens: response.length,
          totalPages: 1,
          currentPage: 1,
          pageSize: response.length || 20
        }
      } else {
        // Single object response - wrap in array
        funcionarios = [response]
        paginacao = {
          totalItens: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 1
        }
      }
    }

    // Transform data to ensure all required fields are present
    const transformedData = {
      dados: funcionarios.map(funcionario => ({
        ...funcionario,
        // Ensure basic employee fields are present
        departamento: funcionario.departamento || "Não informado",
        // Ensure apontamento fields have default values if not present
        valorDiaria: funcionario.valorDiaria || 0,
        diasTrabalhados: funcionario.diasTrabalhados || 0,
        valorAdicional: funcionario.valorAdicional || 0,
        descontos: funcionario.descontos || 0,
        adiantamento: funcionario.adiantamento || 0,
        apontamentoId: funcionario.apontamentoId || null,
        statusApontamento: funcionario.statusApontamento || undefined,
        periodoInicio: funcionario.periodoInicio || undefined,
        periodoFim: funcionario.periodoFim || undefined,
        obraId: funcionario.obraId || undefined,
      })),
      paginacao
    }

    return transformedData
  } catch (error) {
    console.error("Erro ao listar funcionários com apontamentos:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("Token de autenticação")) {
        return { error: "Não autorizado. Faça login novamente." }
      }
      return { error: error.message }
    }
    
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * 8. Listar Apontamentos por Funcionário
 */
export async function listarApontamentosPorFuncionarioAction(
  funcionarioId: string,
  searchParams?: { page?: string; pageSize?: string; status?: string }
): Promise<ApontamentosPaginatedResponse | { error: string }> {
  try {
    // Validar ID
    const idValidation = funcionarioIdSchema.safeParse({ funcionarioId })
    if (!idValidation.success) {
      return { error: "ID de funcionário inválido" }
    }
    
    // Validar parâmetros de query
    const params = searchParams ? {
      page: searchParams.page,
      pageSize: searchParams.pageSize,
      status: searchParams.status
    } : undefined
    
    const queryValidation = funcionariosQuerySchema.safeParse(params || {})
    if (!queryValidation.success) {
      return { error: "Parâmetros de consulta inválidos" }
    }
    
    const apontamentos = await funcionariosService.listarApontamentosPorFuncionario(
      funcionarioId, 
      queryValidation.data
    )
    return apontamentos
  } catch (error) {
    console.error("Erro ao listar apontamentos por funcionário:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return { error: "Funcionário não encontrado" }
      }
      if (error.message.includes("Token de autenticação")) {
        return { error: "Não autorizado. Faça login novamente." }
      }
      return { error: error.message }
    }
    
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

// Manter funções antigas para compatibilidade (deprecated)
export const createFuncionario = criarFuncionarioAction
export const getFuncionarios = listarFuncionariosAction
export const getFuncionarioById = obterFuncionarioAction
export const updateFuncionario = atualizarFuncionarioAction
export const AtivarFuncionario = ativarFuncionarioAction
export const deleteFuncionario = removerFuncionarioAction
export const getFuncionariosApontamentos = listarFuncionariosComUltimoApontamentoAction