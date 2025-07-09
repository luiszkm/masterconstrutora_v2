"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { API_URL, makeAuthenticatedRequest } from "./common";
const url = new URL(`${API_URL}/obras`);

// Tipos
export interface ObraData {
  nome: string;
  cliente: string;
  endereco: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
}
export interface Obra extends ObraData {
  etapas: EtapaObra[];
  orcamentos: number[];
  funcionarios: number[];
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
): Promise<
  { success: true; data: ObraListResponse } | { success: false; error: string }
> {
  try {
    url.searchParams.append("page", page.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    const response = await makeAuthenticatedRequest(url.toString(), {
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
      return { success: false, error: errorMessage };
    }

    const result = await response.json();

    // Validação da estrutura da resposta
    if (
      result &&
      Array.isArray(result.dados) &&
      result.paginacao &&
      typeof result.paginacao.totalItens === "number"
    ) {
      return { success: true, data: result as ObraListResponse };
    } else {
      console.error("Formato inesperado da resposta da API de obras:", result);
      return { success: false, error: "Formato de dados de obras inesperado." };
    }
  } catch (error) {
    console.error("Erro ao buscar lista de obras:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { success: false, error: "Não autorizado. Faça login novamente." };
    }
    return {
      success: false,
      error: "Erro de conexão com o servidor ao buscar obras. Tente novamente.",
    };
  }
}

// Criar nova obra
export async function criarObra(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const novaObra: ObraData = {
    nome: formData.get("nome") as string,
    cliente: formData.get("cliente") as string,
    endereco: formData.get("endereco") as string,
    dataInicio: formData.get("dataInicio") as string,
    dataFim: formData.get("dataFim") as string,
    descricao: formData.get("descricao") as string,
  };

  // Validações
  if (
    !novaObra.nome ||
    !novaObra.cliente ||
    !novaObra.endereco ||
    !novaObra.dataInicio ||
    !novaObra.dataFim
  ) {
    return {
      success: false,
      error: "Todos os campos obrigatórios devem ser preenchidos tsees",
    };
  }

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

      return { success: false, message: errorMessage, funcionarioId: null };
    }

    revalidateTag("obras-list");

    const result = await response.json();

    const obraId = result.id || result.ID || result.obraId || null;

    if (!obraId) {
      console.error(
        "ID do Obra não encontrado na resposta do backend:",
        result
      );
      return {
        success: false,
        message: "ID do Obra não recebido do servidor.",
        obraId: null,
      };
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
      console.log("funcionariosResponse", funcionariosResponse);
      if (!response.ok) {
        let errorMessage = "Erro ao associar funcionários à obra.";
        try {
          const errorData = await funcionariosResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (funcionariosResponse.status === 401) {
            errorMessage = "Não autorizado. Faça login novamente.";
          }
        }
        return { success: false, message: errorMessage, obraId: null };
      }

      revalidateTag(`obra-${obraId}`);
      revalidatePath("/dashboard/obras");
    }

    return {
      success: true,
      message: result.message || "Obra criado com sucesso!",
      obraId: obraId,
    };
  } catch (error) {
    console.error("Erro ao criar Obra:", error);

    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      // Não redirecionamos aqui, o Server Component pai fará isso.
      return {
        success: false,
        message: "Não autorizado. Faça login novamente.",
        obraId: null,
      };
    }

    return {
      success: false,
      message: "Erro de conexão com o servidor. Tente novamente.",
      obraId: null,
    };
  }
}

// Atualizar obra
export async function atualizarObra(id: number, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const obraIndex = obrasMock.findIndex((o) => o.id === id);
  if (obraIndex === -1) {
    return { success: false, error: "Obra não encontrada" };
  }

  const nome = formData.get("nome") as string;
  const cliente = formData.get("cliente") as string;
  const endereco = formData.get("endereco") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;
  const responsavel = formData.get("responsavel") as string;
  const descricao = formData.get("descricao") as string;
  const status = formData.get("status") as
    | "Em andamento"
    | "Concluída"
    | "Pausada";

  // Validações
  if (
    !nome ||
    !cliente ||
    !endereco ||
    !dataInicio ||
    !dataFim ||
    !responsavel
  ) {
    return {
      success: false,
      error: "Todos os campos obrigatórios devem ser preenchidos",
    };
  }

  obrasMock[obraIndex] = {
    ...obrasMock[obraIndex],
    nome,
    cliente,
    endereco,
    dataInicio,
    dataFim,
    responsavel,
    descricao,
    status,
  };

  revalidatePath("/dashboard/obras");
  return { success: true, data: obrasMock[obraIndex] };
}

// Obter obra por ID
export async function getObraById(
  id: string
): Promise<{ success: true; data: Obra } | { success: false; error: string }> {
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
      return { success: false, error: errorMessage };
    }

    const result = await response.json();
    // Validação da estrutura da resposta
      return { success: true, data: result as Obra };
   
  } catch (error) {
    console.error("Erro ao buscar obra:", error);
    if (
      error instanceof Error &&
      error.message === "Token de autenticação não encontrado"
    ) {
      return { success: false, error: "Não autorizado. Faça login novamente." };
    }
    return { success: false, error: "Erro de conexão com o servidor ao buscar obra. Tente novamente." };
  }
}
