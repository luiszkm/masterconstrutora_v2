"use server";

/**
 * @deprecated Este arquivo está sendo migrado para o novo padrão da API
 * Use app/actions/funcionarios.ts para actions de funcionários
 * Use app/actions/apontamentos.ts para actions de apontamentos
 * 
 * Mantenha este arquivo apenas para compatibilidade com código legado
 */

import { revalidateTag } from "next/cache";
import { removerMascaraMonetaria } from "@/app/lib/masks"; // Importar a função de máscara
import { makeAuthenticatedRequest, API_URL } from "./common";
import { createSuccessResponse, createErrorResponse, type CreateActionResponse, type ActionResponse } from "@/types/action-responses";
import { validateFormData } from "@/lib/validations/common";
import { createFuncionarioSchema, updateFuncionarioSchema, funcionarioPaymentSchema } from "@/lib/validations/funcionario";


export type FuncionarioBase = {
  id?: string;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  dataContratacao?: string;
  chavePix?: string;
  observacoes?: string;
  avaliacaoDesempenho?: string; // Pode ser "0" ou uma string representando a avaliação
  motivoDesligamento?: string; // Motivo do desligamento, se aplicável
  desligamentoData?: string; // Data do desligamento, se aplicável
  status?: string; // Status do funcionário (ativo, desligado, etc.)
};

export type FuncionarioPaymentPayload = {
  funcionarioId: string; // ID do funcionário ao qual o pagamento se refere
  diaria?: number;
  diasTrabalhados?: number;
  valorAdicional?: number;
  descontos?: number;
  adiantamento?: number;
  valorTotal?: number;
  periodoInicio: string; // Formato 'YYYY-MM-DD'
  periodoFim: string; // Formato 'YYYY-MM-DD'
  obraId?: string; // Novo campo para vincular o pagamento a uma obra
};

export type Apontamento = {
  id: string; // ID do funcionário
  funcionarioNome: string;
  diaria: number;
  diasTrabalhados: number;
  adicionais: number;
  descontos: number;
  adiantamentos: number;
  status: string;
  apontamentoId: string | null; // ID do apontamento de pagamento, se existir
  periodoInicio?: string | null; // Data de início do período do apontamento
  periodoFim?: string | null; // Data de fim do período do apontamento
  obraId?: string | null; // ID da obra vinculada ao apontamento
  valorTotalCalculado?: number; // Valor total calculado do apontamento
};

export type FuncionarioApontamento = {
  id: string; // ID do funcionário
  nome: string;
  cargo: string;
  departamento: string;
  dataContratacao: string;
  valorDiaria: number;
  diasTrabalhados: number;
  valorAdicional: number;
  descontos: number;
  adiantamento: number;
  chavePix: string;
  avaliacaoDesempenho: string | null;
  observacoes: string;
  statusApontamento: string;
  apontamentoId: string | null;
  periodoInicio?: string | null; // Data de início do período do apontamento
  periodoFim?: string | null; // Data de fim do período do apontamento
  obraId?: string | null; // ID da obra vinculada ao apontamento
};

/**
 * Cria um novo funcionário no backend (apenas dados básicos).
 * Retorna o ID do funcionário criado.
 */
export async function createFuncionario(prevState: any, formData: FormData): Promise<CreateActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, createFuncionarioSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  const funcionarioData = validation.data

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarios`, {
      method: "POST",
      body: JSON.stringify(funcionarioData),
    });

    if (!response.ok) {
      let errorMessage = "Erro ao criar funcionário.";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return createErrorResponse(errorMessage);
    }

    revalidateTag("funcionarios");

    const result = await response.json();

    const funcionarioId =
      result.id || result.ID || result.funcionarioId || null;

    if (!funcionarioId) {
      console.error(
        "ID do funcionário não encontrado na resposta do backend:",
        result
      );
      return createErrorResponse("ID do funcionário não recebido do servidor.");
    }

    return createSuccessResponse(
      result.message || "Funcionário criado com sucesso!",
      { id: funcionarioId }
    );
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }

    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.");
  }
}

/**
 * Cria ou atualiza as informações de pagamento para um funcionário existente.
 * Usa POST para criar e PUT para atualizar.
 */
export async function createFuncionarioPayment(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, funcionarioPaymentSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  const paymentData = validation.data
  const funcionarioId = paymentData.funcionarioId
  const apontamentoId = formData.get("apontamentoId") as string | null

  try {
    const method = apontamentoId ? "PUT" : "POST";
    const url = apontamentoId
      ? `${API_URL}/apontamentos/${apontamentoId}`
      : `${API_URL}/apontamentos`;

    const response = await makeAuthenticatedRequest(url, {
      method: method,
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      let errorMessage = `Erro ao ${apontamentoId ? "atualizar" : "salvar"
        } informações de pagamento.`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return createErrorResponse(errorMessage);
    }

    revalidateTag(`funcionario-${funcionarioId}`);
    revalidateTag("funcionarios-apontamentos"); // Revalida a lista principal

    const result = await response.json();
    return createSuccessResponse(
      result.message ||
      `Informações de pagamento ${apontamentoId ? "atualizadas" : "salvas"} com sucesso!`
    );
  } catch (error) {
    console.error(
      `Erro ao ${apontamentoId ? "atualizar" : "salvar"
      } informações de pagamento:`,
      error
    );

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }

    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.");
  }
}

/**
 * Busca todos os funcionários do backend.
 * (Mantido para compatibilidade, mas a página principal usará getFuncionariosApontamentos)
 */
export async function getFuncionarios(): Promise<
  FuncionarioBase[] | { error: string }
> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarios`, {
      method: "GET",
      next: { tags: ["funcionarios"] },
    });

    if (!response.ok) {
      let errorMessage = "Erro ao buscar funcionários.";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return { error: errorMessage };
    }

    const result = await response.json();
    // Handle paginated response structure
    const data: FuncionarioBase[] = result.dados || result || [];
    return data;
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { error: "Não autorizado. Faça login novamente." };
    }

    return { error: "Erro de conexão com o servidor. Tente novamente." };
  }
}

/**
 * Busca um único funcionário pelo ID.
 */
export async function getFuncionarioById(
  id: string
): Promise<FuncionarioBase | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/${id}`,
      {
        method: "GET",
        next: { tags: [`funcionario-${id}`] },
      }
    );

    if (!response.ok) {
      let errorMessage = `Funcionário com ID ${id} não encontrado.`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return { error: errorMessage };
    }

    const data: FuncionarioBase = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar funcionário com ID ${id}:`, error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { error: "Não autorizado. Faça login novamente." };
    }

    return { error: "Erro de conexão com o servidor. Tente novamente." };
  }
}

/**
 * Atualiza um funcionário existente no backend (apenas dados básicos).
 */
export async function updateFuncionario(
  id: string,
  prevState: any,
  formData: FormData
) {
  try {
    // Extract form data with null handling
    const rawData = {
      nome: formData.get("nome") as string,
      cpf: formData.get("cpf") as string,
      email: formData.get("email") as string,
      telefone: formData.get("telefone") as string,
      cargo: formData.get("cargo") as string,
      departamento: formData.get("departamento") as string,
      dataContratacao: formData.get("dataContratacao") as string,
      chavePix: formData.get("chavePix") as string,
      observacoes: formData.get("observacoes") as string,
      status: formData.get("status") as string,
      avaliacaoDesempenho: formData.get("avaliacaoDesempenho") as string,
      motivoDesligamento: formData.get("motivoDesligamento") as string,
      desligamentoData: formData.get("desligamentoData") as string,
    };

    // Filter out empty strings and null values, but keep empty strings for optional fields
    const funcionarioData: Partial<FuncionarioBase> = {};

    Object.entries(rawData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // For desligamentoData and motivoDesligamento, only include if not empty
        if ((key === 'desligamentoData' || key === 'motivoDesligamento') && value === '') {
          return; // Skip empty desligamento fields
        }
        funcionarioData[key as keyof FuncionarioBase] = value as any;
      }
    });

    // Debug log to verify payload data
    console.log('Update Funcionario Payload:', {
      id,
      status: funcionarioData.status,
      motivoDesligamento: funcionarioData.motivoDesligamento,
      desligamentoData: funcionarioData.desligamentoData,
      hasMotivo: !!funcionarioData.motivoDesligamento,
      hasData: !!funcionarioData.desligamentoData,
      fullPayload: funcionarioData
    });

    if (!id) {
      return {
        success: false,
        message: "ID do funcionário é obrigatório para atualização.",
      };
    }

    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(funcionarioData),
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao atualizar funcionário.";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return { success: false, message: errorMessage };
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || "Funcionário atualizado com sucesso!",
    };
  } catch (error) {
    console.error(`Erro ao atualizar funcionário com ID ${id}:`, error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return {
        success: false,
        message: "Não autorizado. Faça login novamente.",
      };
    }

    return {
      success: false,
      message: "Erro de conexão com o servidor. Tente novamente.",
    };
  }
}


/**
 * Exclui um funcionário do backend.
 */
export async function deleteFuncionario(id: string) {
  if (!id) {
    return {
      success: false,
      message: "ID do funcionário é obrigatório para exclusão.",
    };
  }

  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao excluir funcionário.";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return { success: false, message: errorMessage };
    }

    revalidateTag("funcionarios");
    revalidateTag("funcionarios-apontamentos");

    return { success: true, message: "Funcionário excluído com sucesso!" };
  } catch (error) {
    console.error(`Erro ao excluir funcionário com ID ${id}:`, error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return {
        success: false,
        message: "Não autorizado. Faça login novamente.",
      };
    }

    return {
      success: false,
      message: "Erro de conexão com o servidor. Tente novamente.",
    };
  }
}
export async function AtivarFuncionario(id: string) {
  if (!id) {
    return {
      success: false,
      message: "ID do funcionário é obrigatório para ativação.",
    };
  }

  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/${id}/ativar`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao ativar funcionário.";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }

      return { success: false, message: errorMessage };
    }

    revalidateTag("funcionarios");
    revalidateTag("funcionarios-apontamentos");

    return { success: true, message: "Funcionário ativado com sucesso!" };
  } catch (error) {
    console.error(`Erro ao ativado funcionário com ID ${id}:`, error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return {
        success: false,
        message: "Não autorizado. Faça login novamente.",
      };
    }

    return {
      success: false,
      message: "Erro de conexão com o servidor. Tente novamente.",
    };
  }
}

export async function getFuncionariosApontamentos(): Promise<
  FuncionarioApontamento[] | { error: string }
> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/apontamentos`,
      {
        method: "GET",
        next: { tags: ["funcionarios-apontamentos"] }, // Tag para revalidação de cache
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao buscar apontamentos de funcionários.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }
      return { error: errorMessage };
    }
    const json = await response.json();

    const data: FuncionarioApontamento[] = json ?? [];
    return data;
  } catch (error) {
    console.error("Erro ao buscar apontamentos de funcionários:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { error: "Não autorizado. Faça login novamente." };
    }
    return {
      error:
        "Erro de conexão com o servidor ao buscar apontamentos. Tente novamente.",
    };
  }
}

export async function getFuncionariosApontamentosById(
  id: string
): Promise<Apontamento[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/${id}/apontamentos`,
      {
        method: "GET",
        next: { tags: ["funcionarios-apontamentos"] }, // Tag para revalidação de cache
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao buscar apontamentos de funcionários.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }
      return { error: errorMessage };
    }
    const json = await response.json();
    const data: Apontamento[] = json.dados ?? [];
    return data;
  } catch (error) {
    console.error("Erro ao buscar apontamentos de funcionários:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { error: "Não autorizado. Faça login novamente." };
    }
    return {
      error:
        "Erro de conexão com o servidor ao buscar apontamentos. Tente novamente.",
    };
  }
}

export async function getApontamentos(params?: {
  page?: string;
  pageSize?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: string;
}): Promise<
  { dados: Apontamento[]; paginacao?: any } | { error: string }
> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await makeAuthenticatedRequest(
      `${API_URL}/apontamentos${query}`,
      {
        method: "GET",
        next: { tags: ["funcionarios-apontamentos"] }, // Tag para revalidação de cache
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao buscar apontamentos de funcionários.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }
      return { error: errorMessage };
    }
    const json = await response.json();

    // Handle different response structures
    if (json.dados && Array.isArray(json.dados)) {
      // Paginated response
      return {
        dados: json.dados,
        paginacao: json.paginacao || {
          totalItens: json.dados.length,
          totalPages: 1,
          currentPage: 1,
          pageSize: json.dados.length || 20
        }
      };
    } else if (Array.isArray(json)) {
      // Direct array response
      return {
        dados: json,
        paginacao: {
          totalItens: json.length,
          totalPages: 1,
          currentPage: 1,
          pageSize: json.length || 20
        }
      };
    } else {
      // Single object or unknown structure
      return {
        dados: json ? [json] : [],
        paginacao: {
          totalItens: json ? 1 : 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: 1
        }
      };
    }
  } catch (error) {
    console.error("Erro ao buscar apontamentos de funcionários:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { error: "Não autorizado. Faça login novamente." };
    }
    return {
      error:
        "Erro de conexão com o servidor ao buscar apontamentos. Tente novamente.",
    };
  }
}

export async function HandleReplicarApontamentoPAraPRoximaQuinzena(
  ids: string[]
): Promise<Apontamento[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/apontamentos/replicar`,
      {
        method: "POST",
        body: JSON.stringify({ funcionarioIds: ids }),
        next: { tags: ["funcionarios-apontamentos"] }, // Tag para revalidação de cache
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao buscar apontamentos de funcionários.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        }
      }
      return { error: errorMessage };
    }
    const json = await response.json();
    const data: Apontamento[] = json.dados ?? [];
    return data;
  } catch (error) {
    console.error("Erro ao buscar apontamentos de funcionários:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { error: "Não autorizado. Faça login novamente." };
    }
    return {
      error:
        "Erro de conexão com o servidor ao buscar apontamentos. Tente novamente.",
    };
  }
}