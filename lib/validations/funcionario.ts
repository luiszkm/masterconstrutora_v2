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
 * Schema para status de funcionário conforme documentação oficial
 */
const statusFuncionarioSchema = z.enum(["ATIVO", "INATIVO", "DESLIGADO"])

/**
 * Schema base para funcionário conforme documentação oficial da API
 */
const baseFuncionarioFields = {
  nome: nomeSchema,
  cpf: cpfSchema,
  cargo: z.string().min(1, "Cargo é obrigatório"),
  departamento: z.string().min(1, "Departamento é obrigatório"),
  telefone: telefoneSchema,
  chavePix: z.string().min(1, "Chave PIX é obrigatória"),
  observacoes: observacoesSchema
}

/**
 * Schema para criação de funcionário - Payload CriarFuncionarioRequest
 */
export const criarFuncionarioSchema = createFormDataSchema({
  ...baseFuncionarioFields,
  diaria: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(z.number().min(0.01, "Diária deve ser maior que 0"))
})

/**
 * Schema para atualização de funcionário - Payload AtualizarFuncionarioRequest
 */
export const atualizarFuncionarioSchema = createFormDataSchema({
  nome: emptyStringToUndefined.pipe(nomeSchema).optional(),
  cpf: emptyStringToUndefined.pipe(cpfSchema).optional(),
  cargo: emptyStringToUndefined.optional(),
  departamento: emptyStringToUndefined.optional(),
  valorDiaria: z.union([
    z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))),
    z.number()
  ]).pipe(z.number().min(0.01, "Diária deve ser maior que 0")).optional(),
  chavePix: emptyStringToUndefined.optional(),
  status: statusFuncionarioSchema.optional(),
  telefone: emptyStringToUndefined.pipe(telefoneSchema).optional(),
  motivoDesligamento: emptyStringToUndefined.optional(),
  dataContratacao: emptyStringToUndefined.pipe(dateSchema).optional(),
  desligamentoData: emptyStringToUndefined.pipe(dateSchema).optional(),
  observacoes: observacoesSchema,
  avaliacaoDesempenho: emptyStringToUndefined.optional(),
  email: emptyStringToUndefined.pipe(emailSchema).optional()
})

/**
 * Schema para validação de ID de funcionário
 */
export const funcionarioIdSchema = z.object({
  funcionarioId: idSchema
})

/**
 * Schema para parâmetros de consulta de funcionários
 */
export const funcionariosQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  pageSize: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.string().optional()
})

// Tipos TypeScript inferidos dos schemas
export type CriarFuncionarioData = z.infer<typeof criarFuncionarioSchema>
export type AtualizarFuncionarioData = z.infer<typeof atualizarFuncionarioSchema>
export type FuncionarioIdData = z.infer<typeof funcionarioIdSchema>
export type FuncionariosQueryData = z.infer<typeof funcionariosQuerySchema>

// Manter schemas antigos por compatibilidade (deprecated)
export const funcionarioBaseSchema = criarFuncionarioSchema
export const createFuncionarioSchema = criarFuncionarioSchema
export const updateFuncionarioSchema = atualizarFuncionarioSchema

// Tipos antigos (deprecated)
export type FuncionarioBaseData = CriarFuncionarioData
export type CreateFuncionarioData = CriarFuncionarioData
export type UpdateFuncionarioData = AtualizarFuncionarioData