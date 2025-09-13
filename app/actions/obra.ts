"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { API_URL, makeAuthenticatedRequest } from "./common";
import { Fornecedor } from "@/types/api-types";
import { validateFormData } from "@/lib/validations/common";
import { createObraSchema, updateObraSchema } from "@/lib/validations/obra";
import { createSuccessResponse, createErrorResponse, type CreateActionResponse, type ActionResponse } from "@/types/action-responses";

// Tipos
export interface ObraData {
  nome: string;
  cliente: string;
  endereco: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
}
export interface ObraDetails {
  id: string;
  nome: string;
  cliente: string;
  endereco: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  status: "Em andamento" | "Concluída" | "Pausada";
}
export interface Obra extends ObraDetails {
  etapas: EtapaObra[];
  orcamentos: orcamentoObra[];
  funcionarios: Funcionario[];
  fornecedores: Fornecedor[];
  produtos: ItemProduto[];
}
export type EtapaObra = {
  id: string;
  nome: string;
  concluida: boolean;
  dataInicioPrevista?: string;
  dataFimPrevista?: string;
  dataInicioReal?: string;
  dataFimReal?: string;
};

type ItemProduto = {
  id: number;
  nome: string;
};

type orcamentoObra={
  funcionarioId: number;
  nomeFuncionario: string;
  dataInicioAlocacao: string;
}

type Funcionario = {
  funcionarioId: number;
  nomeFuncionario: string;
  dataInicioAlocacao: string;}


// Tipo para a listagem simplificada de obras
export type ObraListItem = {
  id: string;
  nome: string;
  cliente: string;
  status: string;
  etapa: string;
  evolucao: string; // Mantido como string para corresponder à API ("0 %")
};

export interface ObraListResponse {
  dados: ObraListItem[];
  paginacao: {
    totalItens: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export async function getObrasList(
  page = 1,
  pageSize = 20
): Promise<ActionResponse<ObraListResponse>> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      next: { tags: ["obras-list"] }, // Tag para revalidação de cache
    });

    if (!response.ok) {
      let errorMessage = "Erro ao buscar lista de obras.";
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

    const result = await response.json();

    // Validação da estrutura da resposta
    if (
      result &&
      Array.isArray(result.dados) &&
      result.paginacao &&
      typeof result.paginacao.totalItens === "number"
    ) {
      return createSuccessResponse("Obras listadas com sucesso", result as ObraListResponse);
    } else {
      console.error("Formato inesperado da resposta da API de obras:", result);
      return createErrorResponse("Formato de dados de obras inesperado.");
    }
  } catch (error) {
    console.error("Erro ao buscar lista de obras:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }
    return createErrorResponse(
      "Erro de conexão com o servidor ao buscar obras. Tente novamente."
    );
  }
}
export async function criarObra(formData: FormData): Promise<CreateActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, createObraSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  const novaObra = validation.data

  // Obter funcionários selecionados
  const funcionariosSelecionados = {
    funcionarioIds: formData.getAll("funcionarios").map((id) => id),
    dataInicioAlocacao: novaObra.dataInicio,
  };

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras`, {
      method: "POST",
      body: JSON.stringify(novaObra),
    });

    if (!response.ok) {
      let errorMessage = "Erro ao criar obra.";

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

    revalidateTag("obras-list");

    const result = await response.json();

    const obraId = result.id || result.ID || result.obraId || null;

    if (!obraId) {
      console.error(
        "ID do Obra não encontrado na resposta do backend:",
        result
      );
      return createErrorResponse("ID da obra não recebido do servidor.");
    }
    // Se houver funcionários selecionados, enviar em uma segunda requisição
    if (funcionariosSelecionados.funcionarioIds.length > 0) {
      const funcionariosResponse = await makeAuthenticatedRequest(
        `${API_URL}/obras/${obraId}/alocacoes`,
        {
          method: "POST",
          body: JSON.stringify(funcionariosSelecionados),
        }
      );
      if (!response.ok) {
        let errorMessage = "Erro ao associar funcionários à obra.";
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

      revalidateTag(`obra-${obraId}`);
      revalidatePath("/dashboard/obras");
    }

    return createSuccessResponse(
      result.message || "Obra criada com sucesso!",
      { id: obraId }
    );
  } catch (error) {
    console.error("Erro ao criar Obra:", error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      // Não redirecionamos aqui, o Server Component pai fará isso.
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }

    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.");
  }
}
export async function atualizarObra(id: string, formData: FormData): Promise<ActionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));


  const nome = formData.get("nome") as string;
  const cliente = formData.get("cliente") as string;
  const endereco = formData.get("endereco") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;
  const descricao = formData.get("descricao") as string;
  const status = formData.get("status") as
    | "Em andamento"
    | "Concluída"
    | "Pausada"
    | "Em Planejamento";

  // Validações
  if (
    !nome ||
    !cliente ||
    !endereco ||
    !dataInicio ||
    !dataFim
  ) {
    return createErrorResponse(
      "Todos os campos obrigatórios devem ser preenchidos"
    );
  }

  try {

    const response = await makeAuthenticatedRequest(
      `${API_URL}/obras/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          nome,
          cliente,
          endereco,
          dataInicio,
          dataFim,
          descricao,
          status,
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao atualizar obra.";
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

    revalidateTag(`obra-${id}`);
    revalidatePath("/dashboard/obras");

    return createSuccessResponse("Obra atualizada com sucesso!");
    
  } catch (error) {
    console.error("Erro ao atualizar obra:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }
    return createErrorResponse(
      "Erro de conexão com o servidor ao atualizar obra. Tente novamente."
    );
  }
}
export async function getObraById(
  id: string
): Promise<ActionResponse<Obra>> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras/${id}`, {
      method: "GET",
      next: { tags: [`obra-${id}`] }, // Tag para revalidação de cache
    });

    if (!response.ok) {
      let errorMessage = "Erro ao buscar obra.";
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

    const result = await response.json();
    console.log("Dados da obra:", result);
    // Validação da estrutura da resposta
      return createSuccessResponse("Obra encontrada com sucesso", result as Obra);
   
  } catch (error) {
    console.error("Erro ao buscar obra:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }
    return createErrorResponse("Erro de conexão com o servidor ao buscar obra. Tente novamente.");
  }
}
export async function alocarFuncionario(obraId: string, funcionarioIds: string[]) {
    const funcionariosSelecionados = {
    funcionarioIds: funcionarioIds,
    dataInicioAlocacao: new Date().toISOString().split("T")[0], // Data atual no formato YYYY-MM-DD
  };

  const response = await makeAuthenticatedRequest(
        `${API_URL}/obras/${obraId}/alocacoes`,
        {
          method: "POST",
          body: JSON.stringify(funcionariosSelecionados),
        }
      );
      if (!response.ok) {
        let errorMessage = "Erro ao associar funcionários à obra.";
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

      revalidateTag(`obra-${obraId}`);
      revalidatePath("/dashboard/obras");
    }

export async function excluirObra(id: string): Promise<ActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorMessage = "Erro ao excluir obra.";
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

    revalidateTag("obras-list");
    revalidatePath("/dashboard/obras");

    return createSuccessResponse("Obra excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir obra:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }
    return createErrorResponse("Erro de conexão com o servidor ao excluir obra. Tente novamente.");
  }
}

export async function concluirProximaEtapa(obraId: string): Promise<ActionResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/obras/${obraId}/proxima-etapa`, {
      method: "POST",
    });

    if (!response.ok) {
      let errorMessage = "Erro ao concluir próxima etapa.";
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

    revalidateTag(`obra-${obraId}`);
    revalidateTag("obras-list");
    revalidatePath("/dashboard/obras");

    return createSuccessResponse("Próxima etapa concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao concluir próxima etapa:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return createErrorResponse("Não autorizado. Faça login novamente.");
    }
    return createErrorResponse("Erro de conexão com o servidor ao concluir etapa. Tente novamente.");
  }
}

