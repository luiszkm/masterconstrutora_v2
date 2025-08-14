import { z } from "zod"
import { 
  nomeSchema, 
  dateSchema,
  valorMonetarioSchema,
  descricaoSchema,
  percentualSchema,
  idSchema,
  emptyStringToUndefined,
  createFormDataSchema
} from "./common"

/**
 * Schema para item de orçamento
 */
export const itemOrcamentoSchema = z.object({
  id: emptyStringToUndefined.optional(),
  materialId: idSchema,
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que zero"),
  valorUnitario: valorMonetarioSchema,
  valorTotal: valorMonetarioSchema.optional(), // Calculado automaticamente
  observacoes: emptyStringToUndefined.optional()
})

/**
 * Schema base para orçamento (sem transformações)
 */
const baseOrcamentoFields = {
  titulo: nomeSchema,
  clienteId: idSchema,
  obraId: emptyStringToUndefined.optional(),
  descricao: descricaoSchema,
  dataVencimento: emptyStringToUndefined.pipe(dateSchema).optional(),
  validadeDias: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().min(1, "Validade deve ser pelo menos 1 dia"))
    .optional(),
  margemLucro: z.string()
    .transform(val => Number(val.replace(',', '.')))
    .pipe(percentualSchema)
    .optional(),
  desconto: z.string()
    .transform(val => Number(val.replace(',', '.')))
    .pipe(percentualSchema)
    .optional(),
  observacoes: emptyStringToUndefined.optional(),
  status: z.enum(["RASCUNHO", "PENDENTE", "APROVADO", "REJEITADO", "EXPIRADO"]).default("RASCUNHO")
}

/**
 * Schema base para orçamento
 */
export const orcamentoBaseSchema = createFormDataSchema(baseOrcamentoFields)

/**
 * Schema para criação de orçamento
 */
export const createOrcamentoSchema = createFormDataSchema({
  ...baseOrcamentoFields,
  itens: z.array(itemOrcamentoSchema).min(1, "Orçamento deve ter pelo menos um item")
})

/**
 * Schema para atualização de orçamento
 */
export const updateOrcamentoSchema = createFormDataSchema({
  ...baseOrcamentoFields,
  id: idSchema,
  itens: z.array(itemOrcamentoSchema).min(1, "Orçamento deve ter pelo menos um item")
})

/**
 * Schema para aprovação/rejeição de orçamento
 */
export const aprovarOrcamentoSchema = z.object({
  id: idSchema,
  status: z.enum(["APROVADO", "REJEITADO"]),
  motivoRejeicao: z.string().optional()
}).refine((data) => {
  // Se rejeitado, motivo é obrigatório
  if (data.status === "REJEITADO") {
    return data.motivoRejeicao && data.motivoRejeicao.trim().length > 0
  }
  return true
}, {
  message: "Motivo de rejeição é obrigatório",
  path: ["motivoRejeicao"]
})

/**
 * Schema para filtros de orçamento
 */
export const orcamentoFiltersSchema = z.object({
  search: emptyStringToUndefined.optional(),
  status: z.enum(["RASCUNHO", "PENDENTE", "APROVADO", "REJEITADO", "EXPIRADO"]).optional(),
  clienteId: emptyStringToUndefined.optional(),
  obraId: emptyStringToUndefined.optional(),
  dataInicio: emptyStringToUndefined.pipe(dateSchema).optional(),
  dataFim: emptyStringToUndefined.pipe(dateSchema).optional()
})

// Tipos TypeScript inferidos dos schemas
export type ItemOrcamentoData = z.infer<typeof itemOrcamentoSchema>
export type OrcamentoBaseData = z.infer<typeof orcamentoBaseSchema>
export type CreateOrcamentoData = z.infer<typeof createOrcamentoSchema>
export type UpdateOrcamentoData = z.infer<typeof updateOrcamentoSchema>
export type AprovarOrcamentoData = z.infer<typeof aprovarOrcamentoSchema>
export type OrcamentoFiltersData = z.infer<typeof orcamentoFiltersSchema>