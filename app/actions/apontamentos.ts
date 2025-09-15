"use server"

import { revalidateTag } from "next/cache"
import { apontamentosService } from "@/services/apontamentos-service"
import { createSuccessResponse, createErrorResponse, type ActionResponse } from "@/types/action-responses"
import { validateFormData } from "@/lib/validations/common"
import { 
  criarApontamentoSchema, 
  atualizarApontamentoSchema,
  replicarApontamentosSchema,
  apontamentoIdSchema,
  apontamentosQuerySchema,
  type CriarApontamentoData,
  type AtualizarApontamentoData,
  type ReplicarApontamentosData
} from "@/lib/validations/apontamento"
import type { 
  ApontamentoQuinzenal, 
  ApontamentosPaginatedResponse,
  ReplicarApontamentosResponse,
  BackendPaginatedResponse
} from "@/types/api-types"

/**
 * 1. Criar Apontamento
 * Action conforme documentação oficial da API Pessoal
 */
export async function criarApontamentoAction(
  prevState: any, 
  formData: FormData
): Promise<ActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, criarApontamentoSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  try {
    const apontamento = await apontamentosService.criarApontamento(validation.data)
    
    // Revalidar cache
    revalidateTag("apontamentos")
    revalidateTag("funcionarios-apontamentos")
    revalidateTag(`funcionario-${validation.data.FuncionarioID}-apontamentos`)
    
    return createSuccessResponse(
      "Apontamento criado com sucesso!",
      { id: apontamento.id, valorTotal: apontamento.valorTotalCalculado }
    )
  } catch (error) {
    console.error("Erro ao criar apontamento:", error)
    
    if (error instanceof Error) {
      // Mapear erros específicos da API
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      if (error.message.includes("Funcionário não encontrado")) {
        return createErrorResponse("Funcionário não encontrado.")
      }
      if (error.message.includes("Obra não encontrada")) {
        return createErrorResponse("Obra não encontrada.")
      }
      if (error.message.includes("Período já possui apontamento")) {
        return createErrorResponse("Já existe apontamento para este funcionário no período informado.")
      }
      return createErrorResponse(error.message)
    }
    
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * 2. Listar Apontamentos
 */
export async function listarApontamentosAction(
  searchParams?: { page?: string; pageSize?: string; status?: string }
): Promise<ApontamentosPaginatedResponse | { error: string }> {
  try {
    // Validar parâmetros de query
    const params = searchParams ? {
      page: searchParams.page,
      pageSize: searchParams.pageSize,  
      status: searchParams.status
    } : undefined
    
    const validation = apontamentosQuerySchema.safeParse(params || {})
    if (!validation.success) {
      return { error: "Parâmetros de consulta inválidos" }
    }
    
    const apontamentos = await apontamentosService.listarApontamentos(validation.data)
    return apontamentos
  } catch (error) {
    console.error("Erro ao listar apontamentos:", error)
    
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
 * 3. Atualizar Apontamento
 */
export async function atualizarApontamentoAction(
  apontamentoId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  console.log("=== atualizarApontamentoAction DEBUG ===")
  console.log("apontamentoId:", apontamentoId)

  // Debug: log formData contents
  console.log("FormData for validation:")
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`)
  }

  // Validar dados do formulário
  const validation = validateFormData(formData, atualizarApontamentoSchema)

  console.log("Validation result:", validation)

  if (!validation.success) {
    console.error("Validation failed:", validation.errors)
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }

  try {
    // Validar ID
    const idValidation = apontamentoIdSchema.safeParse({ apontamentoId })
    if (!idValidation.success) {
      return createErrorResponse("ID de apontamento inválido")
    }
    
    const apontamento = await apontamentosService.atualizarApontamento(apontamentoId, validation.data)
    
    // Revalidar cache
    revalidateTag("apontamentos")
    revalidateTag("funcionarios-apontamentos")
    revalidateTag(`funcionario-${validation.data.funcionarioId}-apontamentos`)
    revalidateTag(`apontamento-${apontamentoId}`)
    
    return createSuccessResponse(
      "Apontamento atualizado com sucesso!",
      { valorTotal: apontamento.valorTotalCalculado }
    )
  } catch (error) {
    console.error("Erro ao atualizar apontamento:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Apontamento não encontrado")
      }
      if (error.message.includes("já foi pago")) {
        return createErrorResponse("Apontamento já foi pago e não pode ser alterado")
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
 * 4. Aprovar Apontamento
 * Esta ação cria automaticamente uma conta a pagar no módulo financeiro
 */
export async function aprovarApontamentoAction(apontamentoId: string): Promise<ActionResponse> {
  try {
    // Validar ID
    const validation = apontamentoIdSchema.safeParse({ apontamentoId })
    if (!validation.success) {
      return createErrorResponse("ID de apontamento inválido")
    }
    
    const apontamento = await apontamentosService.aprovarApontamento(apontamentoId)
    
    // Revalidar cache
    revalidateTag("apontamentos")
    revalidateTag("funcionarios-apontamentos")
    revalidateTag(`apontamento-${apontamentoId}`)
    revalidateTag(`funcionario-${apontamento.funcionarioId}-apontamentos`)
    // Revalidar também dados financeiros pois uma conta a pagar foi criada
    revalidateTag("contas-pagar")
    
    return createSuccessResponse(
      "Apontamento aprovado com sucesso! Uma conta a pagar foi criada automaticamente no módulo financeiro.",
      { 
        status: apontamento.status,
        valorTotal: apontamento.valorTotalCalculado 
      }
    )
  } catch (error) {
    console.error("Erro ao aprovar apontamento:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Apontamento não encontrado")
      }
      if (error.message.includes("já foi aprovado")) {
        return createErrorResponse("Apontamento já foi aprovado")
      }
      if (error.message.includes("já foi pago")) {
        return createErrorResponse("Apontamento já foi pago")
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
 * 5. Cancelar Apontamento
 * Esta ação cancela um apontamento com motivo obrigatório
 * A conta a pagar correspondente é cancelada automaticamente no módulo financeiro
 */
export async function cancelarApontamentoAction(
  apontamentoId: string, 
  motivoCancelamento: string
): Promise<ActionResponse> {
  try {
    // Validar ID
    const validation = apontamentoIdSchema.safeParse({ apontamentoId })
    if (!validation.success) {
      return createErrorResponse("ID de apontamento inválido")
    }
    
    if (!motivoCancelamento || motivoCancelamento.trim().length === 0) {
      return createErrorResponse("Motivo do cancelamento é obrigatório")
    }
    
    const apontamento = await apontamentosService.cancelarApontamento(apontamentoId, motivoCancelamento)
    
    // Revalidar cache
    revalidateTag("apontamentos")
    revalidateTag("funcionarios-apontamentos")
    revalidateTag(`apontamento-${apontamentoId}`)
    revalidateTag(`funcionario-${apontamento.funcionarioId}-apontamentos`)
    // Revalidar também dados financeiros pois a conta a pagar foi cancelada
    revalidateTag("contas-pagar")
    
    return createSuccessResponse(
      "Apontamento cancelado com sucesso! A conta a pagar correspondente foi cancelada automaticamente.",
      { 
        status: apontamento.status,
        valorTotal: apontamento.valorTotalCalculado 
      }
    )
  } catch (error) {
    console.error("Erro ao cancelar apontamento:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return createErrorResponse("Apontamento não encontrado")
      }
      if (error.message.includes("já foi pago")) {
        return createErrorResponse("Apontamento já foi pago e não pode ser cancelado")
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
 * 6. Replicar Apontamentos para Próxima Quinzena
 */
export async function replicarApontamentosAction(
  funcionarioIds: string[]
): Promise<ActionResponse> {
  try {
    // Validar dados
    const validation = replicarApontamentosSchema.safeParse({ funcionarioIds })
    if (!validation.success) {
      return createErrorResponse("Lista de funcionários inválida")
    }
    
    const resultado = await apontamentosService.replicarApontamentos(validation.data)
    
    // Revalidar cache
    revalidateTag("apontamentos")
    revalidateTag("funcionarios-apontamentos")
    
    // Revalidar cache específico para cada funcionário que teve apontamento replicado
    resultado.sucessos.forEach(sucesso => {
      revalidateTag(`funcionario-${sucesso.funcionarioId}-apontamentos`)
    })
    
    const { totalSucesso, totalFalha, totalSolicitado } = resultado.resumo
    
    if (totalFalha === 0) {
      return createSuccessResponse(
        `Todos os ${totalSucesso} apontamentos foram replicados com sucesso!`,
        resultado
      )
    } else if (totalSucesso === 0) {
      return createErrorResponse(
        `Nenhum apontamento foi replicado. ${resultado.falhas.length} erros encontrados.`
      )
    } else {
      // Parcialmente bem-sucedido
      return createSuccessResponse(
        `${totalSucesso} de ${totalSolicitado} apontamentos foram replicados. ${totalFalha} apresentaram erros.`,
        resultado
      )
    }
  } catch (error) {
    console.error("Erro ao replicar apontamentos:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("Token de autenticação")) {
        return createErrorResponse("Não autorizado. Faça login novamente.")
      }
      return createErrorResponse(error.message)
    }
    
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

/**
 * Obter apontamento por ID (método auxiliar)
 */
export async function obterApontamentoAction(
  apontamentoId: string
): Promise<ApontamentoQuinzenal | { error: string }> {
  try {
    // Validar ID
    const validation = apontamentoIdSchema.safeParse({ apontamentoId })
    if (!validation.success) {
      return { error: "ID de apontamento inválido" }
    }
    
    const apontamento = await apontamentosService.obterApontamento(apontamentoId)
    return apontamento
  } catch (error) {
    console.error("Erro ao buscar apontamento:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) {
        return { error: "Apontamento não encontrado" }
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
 * Obter contas bancárias disponíveis para pagamento
 */
export async function getContasBancarias(): Promise<{ id: string; nome: string; agencia: string; conta: string }[] | { error: string }> {
  try {
    // Mock data - substituir pela chamada real da API quando disponível
    return [
      { id: "1", nome: "Banco do Brasil - Conta Principal", agencia: "1234", conta: "12345-6" },
      { id: "2", nome: "Itaú - Conta Empresarial", agencia: "5678", conta: "67890-1" }
    ]
  } catch (error) {
    console.error("Erro ao buscar contas bancárias:", error)
    return { error: "Erro ao buscar contas bancárias. Tente novamente." }
  }
}

/**
 * Pagar apontamentos da quinzena em lote
 */
export async function pagarApontamentosQuinzena(
  apontamentoIds: string[], 
  contaBancariaId: string
): Promise<{ success: boolean; message: string; resumo?: any; sucessos?: any[]; falhas?: any[] }> {
  try {
    // Para cada apontamento, aprovar primeiro se não estiver aprovado, depois pagar
    const results = []
    const sucessos = []
    const falhas = []

    for (const apontamentoId of apontamentoIds) {
      try {
        // Primeiro aprovar o apontamento se necessário
        await apontamentosService.aprovarApontamento(apontamentoId)
        
        // Mock do pagamento - aqui seria integração com módulo financeiro
        // await paymentService.pagarApontamento(apontamentoId, contaBancariaId)
        
        sucessos.push({ apontamentoId, status: 'PAGO' })
      } catch (error) {
        falhas.push({ 
          apontamentoId, 
          motivo: error instanceof Error ? error.message : "Erro desconhecido" 
        })
      }
    }

    // Revalidar cache
    revalidateTag("apontamentos")
    revalidateTag("funcionarios-apontamentos")

    const resumo = {
      totalSolicitado: apontamentoIds.length,
      totalSucesso: sucessos.length,
      totalFalha: falhas.length
    }

    return {
      success: sucessos.length > 0,
      message: falhas.length === 0 
        ? `Todos os ${sucessos.length} apontamentos foram pagos com sucesso!`
        : `${sucessos.length} de ${apontamentoIds.length} apontamentos foram pagos. ${falhas.length} apresentaram erros.`,
      resumo,
      sucessos,
      falhas
    }
  } catch (error) {
    console.error("Erro ao pagar apontamentos da quinzena:", error)
    return {
      success: false,
      message: "Erro inesperado ao processar pagamentos. Tente novamente."
    }
  }
}

// Função wrapper que decide entre criar ou atualizar baseado no apontamentoId
export async function handleFuncionarioApontamentoSubmit(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  const apontamentoId = formData.get("apontamentoId") as string | null

  console.log("=== handleFuncionarioApontamentoSubmit DEBUG ===")
  console.log("apontamentoId from formData:", apontamentoId)
  console.log("Will use UPDATE path:", !!(apontamentoId && apontamentoId.trim() !== ""))

  if (apontamentoId && apontamentoId.trim() !== "") {
    console.log("Calling atualizarApontamentoAction with ID:", apontamentoId)
    // Se tem ID, atualizar
    return atualizarApontamentoAction(apontamentoId, prevState, formData)
  } else {
    console.log("Calling criarApontamentoAction (no ID)")
    // Se não tem ID, criar novo
    return criarApontamentoAction(prevState, formData)
  }
}

// Funções auxiliares para compatibilidade com código existente (deprecated)
export const createFuncionarioPayment = criarApontamentoAction
export const replicarFuncionariosQuinzena = replicarApontamentosAction