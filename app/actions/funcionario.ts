"use server";

import { revalidateTag } from "next/cache";

import { removerMascaraMonetaria } from "@/app/lib/masks"; // Importar a função de máscara
import { makeAuthenticatedRequest, API_URL } from "./common";


// Tipo para os dados básicos do funcionário
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

// Tipo para os dados de pagamento do funcionário (para criação/atualização)
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
  };

  if (!funcionarioData.nome) {
    return {
      success: false,
      message: "Nome é obrigatório.",
      funcionarioId: null,
    };
  }

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

      return { success: false, message: errorMessage, funcionarioId: null };
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
      return {
        success: false,
        message: "ID do funcionário não recebido do servidor.",
        funcionarioId: null,
      };
    }

    return {
      success: true,
      message: result.message || "Funcionário criado com sucesso!",
      funcionarioId: funcionarioId,
    };
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      // Não redirecionamos aqui, o Server Component pai fará isso.
      return {
        success: false,
        message: "Não autorizado. Faça login novamente.",
        funcionarioId: null,
      };
    }

    return {
      success: false,
      message: "Erro de conexão com o servidor. Tente novamente.",
      funcionarioId: null,
    };
  }
}

/**
 * Cria ou atualiza as informações de pagamento para um funcionário existente.
 * Usa POST para criar e PUT para atualizar.
 */
export async function createFuncionarioPayment(
  prevState: any,
  formData: FormData
) {
  const funcionarioId = formData.get("funcionarioId") as string;
  const apontamentoId = formData.get("apontamentoId") as string | null; // Pode ser nulo para criação

  const paymentData: FuncionarioPaymentPayload = {
    funcionarioId: funcionarioId,
    diaria: removerMascaraMonetaria((formData.get("diaria") as string) || "0"),
    diasTrabalhados: Number.parseInt(
      (formData.get("diasTrabalhados") as string) || "0"
    ), // Corrigido aqui
    valorAdicional: removerMascaraMonetaria(
      (formData.get("valorAdicional") as string) || "0"
    ),
    descontos: removerMascaraMonetaria(
      (formData.get("descontos") as string) || "0"
    ),
    adiantamento: removerMascaraMonetaria(
      (formData.get("adiantamento") as string) || "0"
    ),
    valorTotal: removerMascaraMonetaria(
      (formData.get("valorTotal") as string) || "0"
    ),
    periodoInicio: formData.get("periodoInicio") as string,
    periodoFim: formData.get("periodoFim") as string,
    obraId: formData.get("obraId") as string,
  };

  if (!funcionarioId || !paymentData.periodoInicio || !paymentData.periodoFim) {
    return {
      success: false,
      message: "ID do funcionário e período de pagamento são obrigatórios.",
    };
  }

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

      return { success: false, message: errorMessage };
    }

    revalidateTag(`funcionario-${funcionarioId}`);
    revalidateTag("funcionarios-apontamentos"); // Revalida a lista principal

    const result = await response.json();
    return {
      success: true,
      message:
        result.message ||
        `Informações de pagamento ${apontamentoId ? "atualizadas" : "salvas"
        } com sucesso!`,
    };
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

    const data: FuncionarioBase[] = await response.json();
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
    };

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

// update apntamento de funcionario
/**
 * Atualiza um apontamento de funcionário existente no backend.
 */
export async function handleFuncionarioApontamentoSubmit(
  prevState: any,
  formData: FormData
) {
  const funcionarioId = formData.get("funcionarioId") as string;
  const apontamentoId = formData.get("apontamentoId") as string | null; // Pode ser nulo para criação
  try {
    const funcionarioData: Partial<FuncionarioPaymentPayload> = {
      // Campos numéricos e de seleção que precisam ser parseados
      diaria: removerMascaraMonetaria(formData.get("diaria") as string),
      diasTrabalhados: Number.parseInt(
        (formData.get("diasTrabalhados") as string) || "0"
      ),
      valorAdicional: removerMascaraMonetaria(
        formData.get("valorAdicional") as string
      ),
      descontos: removerMascaraMonetaria(formData.get("descontos") as string),
      adiantamento: removerMascaraMonetaria(
        formData.get("adiantamento") as string
      ),
      periodoFim: formData.get("periodoFim") as string,
      periodoInicio: formData.get("periodoInicio") as string,
    };

    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/apontamentos/${apontamentoId}`,
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
    console.error(
      `Erro ao atualizar funcionário com ID ${apontamentoId}:`,
      error
    );

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
      message: "ID do funcionário é obrigatório para exclusão.",
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
/**
 * Busca a lista de obras do backend.
 */


/**
 * Busca a lista de apontamentos de funcionários do backend.
 */
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

export async function getApontamentos(): Promise<
  Apontamento[] | { error: string }
> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/apontamentos`,
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


export async function HandleReplicarApontamentoPAraPRoximaQuinzena(
  ids: string[]
): Promise<Apontamento[] | { error: string }> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_URL}/funcionarios/replicar`,
      {
        method: "POST",
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