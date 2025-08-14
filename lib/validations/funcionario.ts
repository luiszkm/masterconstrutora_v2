import { z } from "zod"
import { 
  nomeSchema, 
  cpfSchema, 
  emailSchema, 
  telefoneSchema, 
  dateSchema,
  valorMonetarioSchema,
  observacoesSchema,
  idSchema,
  emptyStringToUndefined,
  createFormDataSchema
} from "./common"

/**
 * Schema base para funcionário (sem transformações)
 */
const baseFuncionarioFields = {
  nome: nomeSchema,
  cpf: emptyStringToUndefined.pipe(cpfSchema).optional(),
  email: emptyStringToUndefined.pipe(emailSchema).optional(),
  telefone: emptyStringToUndefined.pipe(telefoneSchema).optional(),
  cargo: emptyStringToUndefined.optional(),
  departamento: emptyStringToUndefined.optional(),
  dataContratacao: emptyStringToUndefined.pipe(dateSchema).optional(),
  chavePix: emptyStringToUndefined.optional(),
  observacoes: observacoesSchema
}

/**
 * Schema base para funcionário
 */
export const funcionarioBaseSchema = createFormDataSchema(baseFuncionarioFields)

/**
 * Schema para criação de funcionário
 */
export const createFuncionarioSchema = funcionarioBaseSchema

/**
 * Schema para atualização de funcionário
 */
export const updateFuncionarioSchema = createFormDataSchema({
  ...baseFuncionarioFields,
  id: idSchema
})

/**
 * Schema para pagamento de funcionário
 */
export const funcionarioPaymentSchema = createFormDataSchema({
  funcionarioId: idSchema,
  apontamentoId: emptyStringToUndefined.optional(),
  diaria: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
  diasTrabalhados: z.string().transform(val => parseInt(val)).pipe(z.number().min(1, "Dias trabalhados deve ser maior que 0")),
  valorAdicional: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  descontos: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  adiantamento: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  valorTotal: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  periodoInicio: dateSchema,
  periodoFim: dateSchema,
  obraId: emptyStringToUndefined.optional()
})

// Tipos TypeScript inferidos dos schemas
export type FuncionarioBaseData = z.infer<typeof funcionarioBaseSchema>
export type CreateFuncionarioData = z.infer<typeof createFuncionarioSchema>
export type UpdateFuncionarioData = z.infer<typeof updateFuncionarioSchema>
export type FuncionarioPaymentData = z.infer<typeof funcionarioPaymentSchema>