import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT, type RequestOptions } from "./api-config"
import { getJWTToken } from "./session"

/**
 * Classe de erro personalizada para erros da API
 */
export class ApiError extends Error {
  status: number
  data: any

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

/**
 * Função para verificar se a resposta da API é bem-sucedida
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Se a resposta não for bem-sucedida, lança um erro
  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch (e) {
      errorData = { message: "Erro desconhecido" }
    }

    throw new ApiError(response.status, errorData.message || `Erro ${response.status}`, errorData)
  }

  // Se a resposta for bem-sucedida, retorna os dados
  try {
    return (await response.json()) as T
  } catch (e) {
    // Se não houver dados JSON, retorna um objeto vazio
    return {} as T
  }
}

/**
 * Função para adicionar um timeout à requisição
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(408, "Tempo limite da requisição excedido"))
    }, ms)
  })

  return Promise.race([promise, timeout])
}

/**
 * Função para adicionar headers de autenticação
 */
async function getAuthHeaders(skipAuth?: boolean): Promise<Record<string, string>> {
  if (skipAuth) {
    return {}
  }
  
  const jwtToken = await getJWTToken()
  if (jwtToken) {
    return {
      Cookie: `jwt-token=${jwtToken}`,
    }
  }
  return {}
}

/**
 * Cliente HTTP base para fazer requisições à API
 */
export const apiClient = {
  /**
   * Faz uma requisição GET
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const authHeaders = await getAuthHeaders(options?.skipAuth)

    try {
      const response = await withTimeout(
        fetch(url, {
          method: "GET",
          headers: {
            ...DEFAULT_HEADERS,
            ...authHeaders,
            ...options?.headers,
          },
          cache: options?.cache,
          next: options?.next,
          credentials: "include",
        }),
        REQUEST_TIMEOUT,
      )

      return handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "Erro ao fazer requisição", error)
    }
  },

  /**
   * Faz uma requisição POST
   */
  async post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const authHeaders = await getAuthHeaders(options?.skipAuth)

    try {
      const response = await withTimeout(
        fetch(url, {
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            ...authHeaders,
            ...options?.headers,
          },
          body: JSON.stringify(data),
          cache: options?.cache,
          next: options?.next,
          credentials: "include",
        }),
        REQUEST_TIMEOUT,
      )

      return handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "Erro ao fazer requisição", error)
    }
  },

  /**
   * Faz uma requisição PUT
   */
  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const authHeaders = await getAuthHeaders(options?.skipAuth)

    try {
      const response = await withTimeout(
        fetch(url, {
          method: "PUT",
          headers: {
            ...DEFAULT_HEADERS,
            ...authHeaders,
            ...options?.headers,
          },
          body: JSON.stringify(data),
          cache: options?.cache,
          next: options?.next,
          credentials: "include",
        }),
        REQUEST_TIMEOUT,
      )

      return handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "Erro ao fazer requisição", error)
    }
  },

  /**
   * Faz uma requisição PATCH
   */
  async patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const authHeaders = await getAuthHeaders(options?.skipAuth)

    try {
      const response = await withTimeout(
        fetch(url, {
          method: "PATCH",
          headers: {
            ...DEFAULT_HEADERS,
            ...authHeaders,
            ...options?.headers,
          },
          body: JSON.stringify(data),
          cache: options?.cache,
          next: options?.next,
          credentials: "include",
        }),
        REQUEST_TIMEOUT,
      )

      return handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "Erro ao fazer requisição", error)
    }
  },

  /**
   * Faz uma requisição DELETE
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const authHeaders = await getAuthHeaders(options?.skipAuth)

    try {
      const response = await withTimeout(
        fetch(url, {
          method: "DELETE",
          headers: {
            ...DEFAULT_HEADERS,
            ...authHeaders,
            ...options?.headers,
          },
          cache: options?.cache,
          next: options?.next,
          credentials: "include",
        }),
        REQUEST_TIMEOUT,
      )

      return handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "Erro ao fazer requisição", error)
    }
  },
}
