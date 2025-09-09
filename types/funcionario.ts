import type { FuncionarioComUltimoApontamento, BackendPaginatedResponse } from "@/types/api-types"

// Tipo para resposta da API com paginação
export type FuncionariosResponse = BackendPaginatedResponse<FuncionarioComUltimoApontamento>