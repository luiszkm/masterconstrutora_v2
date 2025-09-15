import { z } from "zod"
import { 
  dateSchema,
  valorMonetarioSchema,
  idSchema,
  emptyStringToUndefined,
  createFormDataSchema
} from "./common"

/**
 * Schema para status de apontamento conforme documentação oficial
 */
const statusApontamentoSchema = z.enum(["EM_ABERTO", "APROVADO_PARA_PAGAMENTO", "PAGO", "CANCELADO"])

/**
 * Schema para criação de apontamento - validates frontend camelCase input
 * and transforms to API PascalCase format
 */
export const criarApontamentoSchema = createFormDataSchema({
  funcionarioId: idSchema,
  obraId: idSchema,
  periodoInicio: dateSchema.transform(date => {
    // Converte para formato "YYYY-MM-DD" conforme documentação
    return new Date(date).toISOString().split('T')[0]
  }),
  periodoFim: dateSchema.transform(date => {
    // Converte para formato "YYYY-MM-DD" conforme documentação
    return new Date(date).toISOString().split('T')[0]
  }),
  diaria: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(z.number().min(0.01, "Diária deve ser maior que 0")),
  diasTrabalhados: z.union([
    z.string().transform(val => parseInt(val)),
    z.number()
  ]).pipe(z.number().min(1, "Dias trabalhados deve ser maior que 0").max(31, "Dias trabalhados não pode ser maior que 31")),
  valorAdicional: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(valorMonetarioSchema),
  descontos: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(valorMonetarioSchema),
  adiantamento: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(valorMonetarioSchema)
}).transform(data => ({
  // Transform camelCase frontend data to PascalCase API format
  FuncionarioID: data.funcionarioId,
  ObraID: data.obraId,
  PeriodoInicio: data.periodoInicio,
  PeriodoFim: data.periodoFim,
  Diaria: data.diaria,
  DiasTrabalhados: data.diasTrabalhados,
  ValorAdicional: data.valorAdicional,
  Descontos: data.descontos,
  Adiantamento: data.adiantamento
}))

/**
 * Schema para atualização de apontamento - Payload AtualizarApontamentoRequest
 */
export const atualizarApontamentoSchema = createFormDataSchema({
  funcionarioId: idSchema,
  obraId: idSchema,
  periodoInicio: dateSchema.transform(date => {
    return new Date(date).toISOString().split('T')[0]
  }),
  periodoFim: dateSchema.transform(date => {
    return new Date(date).toISOString().split('T')[0]
  }),
  diaria: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(z.number().min(0.01, "Diária deve ser maior que 0")),
  diasTrabalhados: z.union([
    z.string().transform(val => parseInt(val)),
    z.number()
  ]).pipe(z.number().min(1, "Dias trabalhados deve ser maior que 0").max(31, "Dias trabalhados não pode ser maior que 31")),
  valorAdicional: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(valorMonetarioSchema),
  descontos: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(valorMonetarioSchema),
  adiantamento: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(valorMonetarioSchema),
  status: statusApontamentoSchema.optional()
})

/**
 * Schema para replicação de apontamentos - Payload ReplicarApontamentosRequest
 */
export const replicarApontamentosSchema = z.object({
  funcionarioIds: z.array(idSchema).min(1, "Selecione pelo menos um funcionário")
})

/**
 * Schema para validação de ID de apontamento
 */
export const apontamentoIdSchema = z.object({
  apontamentoId: idSchema
})

/**
 * Schema para parâmetros de consulta de apontamentos
 */
export const apontamentosQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  pageSize: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: statusApontamentoSchema.optional()
})

/**
 * Schema para validação de período quinzenal
 */
export const periodoQuinzenalSchema = z.object({
  inicio: dateSchema,
  fim: dateSchema
}).refine((data) => {
  const inicio = new Date(data.inicio)
  const fim = new Date(data.fim)
  const diffDays = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  
  // Valida se é realmente uma quinzena (entre 14 e 16 dias)
  return diffDays >= 14 && diffDays <= 16
}, {
  message: "O período deve ser de aproximadamente 15 dias (quinzena)"
})

// Tipos TypeScript inferidos dos schemas
export type CriarApontamentoData = z.infer<typeof criarApontamentoSchema>
export type AtualizarApontamentoData = z.infer<typeof atualizarApontamentoSchema>
export type ReplicarApontamentosData = z.infer<typeof replicarApontamentosSchema>
export type ApontamentoIdData = z.infer<typeof apontamentoIdSchema>
export type ApontamentosQueryData = z.infer<typeof apontamentosQuerySchema>
export type PeriodoQuinzenalData = z.infer<typeof periodoQuinzenalSchema>