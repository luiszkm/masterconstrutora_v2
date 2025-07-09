/**
 * Função auxiliar para obter o token JWT da sessão
 * Exportada para ser usada diretamente em Server Components.
 */

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

/**
 * Função auxiliar para fazer requisições autenticadas
 */
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