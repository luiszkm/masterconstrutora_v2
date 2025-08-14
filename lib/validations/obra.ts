import { z } from "zod"
import { 
  nomeSchema, 
  dateSchema,
  valorMonetarioSchema,
  descricaoSchema,
  idSchema,
  emptyStringToUndefined,
  createFormDataSchema
} from "./common"

/**
 * Schema base para obra (sem transformações)
 */
const baseObraSchema = {
  nome: nomeSchema,
  cliente: nomeSchema,
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  dataInicio: dateSchema,
  dataFim: emptyStringToUndefined.pipe(dateSchema).optional(),
  descricao: descricaoSchema,
  orcamento: emptyStringToUndefined
    .transform(val => val ? Number(val.replace(/[^\d,]/g, '').replace(',', '.')) : undefined)
    .pipe(valorMonetarioSchema)
    .optional(),
  status: z.enum(["PLANEJAMENTO", "EM_ANDAMENTO", "PAUSADA", "CONCLUIDA", "CANCELADA"]).default("PLANEJAMENTO")
}

/**
 * Schema para criação de obra
 */
export const createObraSchema = createFormDataSchema(baseObraSchema)

/**
 * Schema para atualização de obra
 */
export const updateObraSchema = createFormDataSchema({
  ...baseObraSchema,
  id: idSchema
})

/**
 * Schema para associar funcionários à obra
 */
export const associarFuncionariosSchema = z.object({
  obraId: idSchema,
  funcionarioIds: z.array(idSchema).min(1, "Selecione pelo menos um funcionário")
})

/**
 * Schema para filtros de obra
 */
export const obraFiltersSchema = z.object({
  search: emptyStringToUndefined.optional(),
  status: emptyStringToUndefined.optional(),
  cliente: emptyStringToUndefined.optional(),
  dataInicio: emptyStringToUndefined.pipe(dateSchema).optional(),
  dataFim: emptyStringToUndefined.pipe(dateSchema).optional()
})

// Tipos TypeScript inferidos dos schemas
export type CreateObraData = z.infer<typeof createObraSchema>
export type UpdateObraData = z.infer<typeof updateObraSchema>
export type AssociarFuncionariosData = z.infer<typeof associarFuncionariosSchema>
export type ObraFiltersData = z.infer<typeof obraFiltersSchema>