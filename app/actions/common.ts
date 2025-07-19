import { cookies } from "next/headers";
import { decrypt } from "../lib/session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getJWTToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const payload = await decrypt(sessionCookie);

  if (!payload || !payload.jwtToken) {
    return null;
  }

  return payload.jwtToken;
}

export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
) {
  const jwtToken = await getJWTToken();

  if (!jwtToken) {
    // Se o token não for encontrado, lançamos um erro.
    // O Server Component que chama esta função deve lidar com o redirecionamento.
    throw new Error("Token de autenticação não encontrado");
  }

  const headers = {
    "Content-Type": "application/json",
    Cookie: `jwt-token=${jwtToken}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}


export interface Meterial {
  id: string;
  nome: string;
}

export async function GetMaterials (): Promise<{
  success: boolean;
  message: string;
  materials?: Meterial[];
}> {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/materiais`);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Erro ao buscar materiais",
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Materiais obtidos com sucesso",
      materials: data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}