import { z } from "zod"

/**
 * Schema para validação de status de etapa
 */
export const statusEtapaSchema = z.enum(["Completa", "Em Andamento", "Pendente"], {
  errorMap: () => ({ message: "Status deve ser Completa, Em Andamento ou Pendente" })
})

/**
 * Schema para validação de ID de etapa
 */
export const etapaIdSchema = z.object({
  etapaId: z.string()
    .min(1, "ID da etapa é obrigatório")
    .uuid("ID da etapa deve ser um UUID válido")
})

/**
 * Schema para validação de ID de obra
 */
export const obraIdSchema = z.object({
  obraId: z.string()
    .min(1, "ID da obra é obrigatório")
    .uuid("ID da obra deve ser um UUID válido")
})

/**
 * Schema para validação de data no formato ISO
 */
export const dataSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
  .refine((date) => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, "Data inválida")

/**
 * Schema para atualização de status de etapa
 */
export const atualizarStatusEtapaSchema = z.object({
  status: statusEtapaSchema,
  dataInicioReal: dataSchema.optional(),
  dataFimReal: dataSchema.optional()
}).refine((data) => {
  // Se status é "Completa", deve ter dataFimReal
  if (data.status === "Completa" && !data.dataFimReal) {
    return false
  }
  // Se status é "Em Andamento", deve ter dataInicioReal
  if (data.status === "Em Andamento" && !data.dataInicioReal) {
    return false
  }
  return true
}, {
  message: "Status 'Completa' requer dataFimReal, 'Em Andamento' requer dataInicioReal"
})

/**
 * Schema para validar dados de etapa da API externa
 */
export const etapaAPISchema = z.object({
  ID: z.string().uuid(),
  ObraID: z.string().uuid(),
  Nome: z.string().min(1, "Nome da etapa é obrigatório"),
  data_inicio_prevista: z.string(),
  data_fim_prevista: z.string(),
  Status: statusEtapaSchema
})

/**
 * Schema para resposta da API de etapas
 */
export const etapasResponseSchema = z.object({
  dados: z.array(etapaAPISchema),
  paginacao: z.object({
    totalItens: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    pageSize: z.number()
  })
})

/**
 * Tipos inferidos dos schemas
 */
export type StatusEtapa = z.infer<typeof statusEtapaSchema>
export type AtualizarStatusEtapaData = z.infer<typeof atualizarStatusEtapaSchema>
export type EtapaAPIData = z.infer<typeof etapaAPISchema>
export type EtapasResponseData = z.infer<typeof etapasResponseSchema>