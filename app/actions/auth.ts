"use server"

import { redirect } from "next/navigation"
import { createSession, deleteSession } from "@/app/lib/session"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { validateFormData } from "@/lib/validations/common"
import { loginSchema } from "@/lib/validations/auth"
import { createErrorResponse, type AuthActionResponse } from "@/types/action-responses"

import { API_URL } from "./common"

export async function login(prevState: any, formData: FormData): Promise<AuthActionResponse> {
  // Validar dados do formulário
  const validation = validateFormData(formData, loginSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  const { email, password: senha } = validation.data

  try {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return createErrorResponse(errorData.message || "Credenciais inválidas.")
    }

    const result = await response.json()

    // Extrair o token da resposta com validação adequada
    const accessToken = result.AccessToken || result.access_token || result.token || result.accessToken
    const userId = result.UserId || result.userId || result.user_id
    
    // Validar o token JWT
    if (!accessToken) {
      return createErrorResponse("Token de acesso não recebido do servidor.")
    }
    
    // Validar formato básico do JWT (deve começar com 'eyJ')
    if (typeof accessToken !== 'string' || !accessToken.startsWith('eyJ')) {
      return createErrorResponse("Token de acesso inválido recebido do servidor.")
    }
    
    // Validar userId
    if (!userId) {
      return createErrorResponse("Identificação do usuário não recebida do servidor.")
    }

    // Criar sessão do Next.js com o token JWT
    await createSession({
      userId: userId,
      jwtToken: accessToken,
      email: email,
    })

    redirect("/dashboard/funcionarios")
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error
    }

    console.error("Erro ao tentar login:", error)
    return createErrorResponse("Erro de conexão com o servidor. Tente novamente.")
  }
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
