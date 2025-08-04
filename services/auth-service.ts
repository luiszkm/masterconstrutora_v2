import { apiClient } from "@/app/lib/api-client"
import type { User } from "@/types/api-types"

/**
 * Serviço para autenticação e gerenciamento de usuários
 */
export const authService = {
  /**
   * Realiza login do usuário
   */
  async login(
    email: string,
    senha: string,
  ): Promise<{
    user: User
    token: string
  }> {
    // Para login, não precisamos de autenticação prévia
    return apiClient.post<any>("/usuarios/login", { email, senha }, {
      skipAuth: true // Não incluir headers de autenticação no login
    })
  },

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    return apiClient.post<void>("/auth/logout", {})
  },

  /**
   * Obtém o usuário atual
   */
  async getUser(): Promise<User> {
    return apiClient.get<User>("/auth/me", {
      next: { revalidate: 60 }, // Cache por 1 minuto
    })
  },

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>("/auth/profile", data)
  },

  /**
   * Altera a senha do usuário
   */
  async changePassword(senhaAtual: string, novaSenha: string): Promise<void> {
    return apiClient.post<void>("/auth/change-password", {
      senhaAtual,
      novaSenha,
    })
  },

  /**
   * Solicita redefinição de senha
   */
  async forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>("/auth/forgot-password", { email })
  },

  /**
   * Redefine a senha com o token
   */
  async resetPassword(token: string, novaSenha: string): Promise<void> {
    return apiClient.post<void>("/auth/reset-password", {
      token,
      novaSenha,
    })
  },
}
