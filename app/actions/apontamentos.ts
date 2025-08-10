"use server";

import { revalidateTag } from "next/cache";
import { removerMascaraMonetaria } from "@/app/lib/masks"; // Importar a função de máscara
import { API_URL, makeAuthenticatedRequest } from "./common";


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
      let errorMessage = `Erro ao ${
        apontamentoId ? "atualizar" : "salvar"
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
        `Informações de pagamento ${
          apontamentoId ? "atualizadas" : "salvas"
        } com sucesso!`,
    };
  } catch (error) {
    console.error(
      `Erro ao ${
        apontamentoId ? "atualizar" : "salvar"
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



/**
 * Replica funcionários para a próxima quinzena
 */
export async function replicarFuncionariosQuinzena(funcionariosIds: string[]) {
  if (!funcionariosIds || funcionariosIds.length === 0) {
    return { success: false, message: "Lista de funcionários é obrigatória para replicação." }
  }

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/funcionarios/apontamentos/replicar`, {
      method: "POST",
      body: JSON.stringify({ funcionarioIds: funcionariosIds }),
    })

    if (!response.ok) {
      let errorMessage = "Erro ao replicar funcionários para a próxima quinzena."

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

    const result = await response.json()

    // Revalidar cache após replicação
    revalidateTag("funcionarios")
    revalidateTag("funcionarios-apontamentos")

    return {
      success: true,
      message: "Replicação processada com sucesso!",
      resumo: result.resumo,
      sucessos: result.sucessos,
      falhas: result.falhas,
    }
  } catch (error) {
    console.error("Erro ao replicar funcionários:", error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { success: false, message: "Não autorizado. Faça login novamente." }
    }

    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function pagarApontamentosQuinzena(apontamentosIds: string[], contaBancariaId: string) {
  if (!apontamentosIds || apontamentosIds.length === 0) {
    return { success: false, message: "Lista de apontamentos é obrigatória para pagamento." }
  }

  if (!contaBancariaId) {
    return { success: false, message: "Conta bancária é obrigatória para pagamento." }
  }

  try {
    // Fazer uma requisição para cada apontamento
    const resultados = await Promise.allSettled(
      apontamentosIds.map(async (apontamentoId) => {
        const response = await makeAuthenticatedRequest(`${API_URL}/apontamentos/${apontamentoId}/pagar`, {
          method: "PATCH",
          body: JSON.stringify({
            contaBancariaId: contaBancariaId,
            apontamentoId: [apontamentoId],
          }),
        })

        if (!response.ok) {
          let errorMessage = "Erro ao processar pagamento."
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch {
            if (response.status === 401) {
              errorMessage = "Não autorizado. Faça login novamente."
            }
          }
          throw new Error(errorMessage)
        }

        const result = await response.json()
        return { apontamentoId, success: true, message: result.message || "Pagamento processado com sucesso!" }
      }),
    )

    // Processar resultados
    const sucessos = resultados
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value)

    const falhas = resultados
      .filter((result) => result.status === "rejected")
      .map((result, index) => ({
        apontamentoId: apontamentosIds[index],
        motivo: (result as PromiseRejectedResult).reason.message,
      }))

    // Revalidar cache após pagamentos
    revalidateTag("funcionarios")
    revalidateTag("funcionarios-apontamentos")

    return {
      success: true,
      message: "Processamento de pagamentos concluído!",
      resumo: {
        totalSolicitado: apontamentosIds.length,
        totalSucesso: sucessos.length,
        totalFalha: falhas.length,
      },
      sucessos,
      falhas,
    }
  } catch (error) {
    console.error("Erro ao processar pagamentos:", error)

    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { success: false, message: "Não autorizado. Faça login novamente." }
    }

    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Busca lista de contas bancárias disponíveis
 */
export async function getContasBancarias(): Promise<
  { id: string; nome: string; agencia: string; conta: string }[] | { error: string }
> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/contas-bancarias`, {
      method: "GET",
      next: { tags: ["contas-bancarias"] },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao buscar contas bancárias."
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

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar contas bancárias:", error)
    if (error instanceof Error && error.message === "Token de autenticação não encontrado") {
      return { error: "Não autorizado. Faça login novamente." }
    }
    return { error: "Erro de conexão com o servidor ao buscar contas bancárias. Tente novamente." }
  }
}
