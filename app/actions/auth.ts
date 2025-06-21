"use server"

import { redirect } from "next/navigation"
import { createSession, deleteSession } from "@/app/lib/session"
import { isRedirectError } from "next/dist/client/components/redirect-error"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const senha = formData.get("password") as string

  if (!email || !senha) {
    return { success: false, message: "Email e senha são obrigatórios." }
  }

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
      return { success: false, message: errorData.message || "Credenciais inválidas." }
    }

    const result = await response.json()

    // Extrair o token da resposta - vamos tentar diferentes variações
    const accessToken = result.AccessToken || result.access_token || result.token || result.accessToken
    const userId = result.UserId || result.userId || result.user_id || email

 

    if (!accessToken) {
      return { success: false, message: "Token de acesso não recebido do servidor." }
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
    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

export async function logout() {
  await deleteSession()
  redirect("/auth/login")
}
