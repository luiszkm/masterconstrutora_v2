import { z } from "zod"
import { 
  nomeSchema, 
  cnpjSchema,
  cpfSchema,
  emailSchema, 
  telefoneSchema,
  cepSchema,
  observacoesSchema,
  idSchema,
  emptyStringToUndefined,
  createFormDataSchema
} from "./common"

/**
 * Schema base para fornecedor (sem transformações)
 */
const baseFornecedorFields = {
  nome: nomeSchema,
  tipoDocumento: z.enum(["CPF", "CNPJ"]),
  documento: z.string().min(1, "Documento é obrigatório"),
  email: emptyStringToUndefined.pipe(emailSchema).optional(),
  telefone: emptyStringToUndefined.pipe(telefoneSchema).optional(),
  endereco: emptyStringToUndefined.optional(),
  cep: emptyStringToUndefined.pipe(cepSchema).optional(),
  cidade: emptyStringToUndefined.optional(),
  estado: emptyStringToUndefined.optional(),
  contato: emptyStringToUndefined.optional(),
  observacoes: observacoesSchema
}

/**
 * Schema base para fornecedor
 */
export const fornecedorBaseSchema = createFormDataSchema(baseFornecedorFields).refine((data) => {
  // Validar documento baseado no tipo
  if (data.tipoDocumento === "CPF") {
    return cpfSchema.safeParse(data.documento).success
  } else if (data.tipoDocumento === "CNPJ") {
    return cnpjSchema.safeParse(data.documento).success
  }
  return true
}, {
  message: "Documento inválido para o tipo selecionado",
  path: ["documento"]
})

/**
 * Schema para criação de fornecedor
 */
export const createFornecedorSchema = fornecedorBaseSchema

/**
 * Schema para atualização de fornecedor
 */
export const updateFornecedorSchema = createFormDataSchema({
  ...baseFornecedorFields,
  id: idSchema
}).refine((data) => {
  // Validar documento baseado no tipo
  if (data.tipoDocumento === "CPF") {
    return cpfSchema.safeParse(data.documento).success
  } else if (data.tipoDocumento === "CNPJ") {
    return cnpjSchema.safeParse(data.documento).success
  }
  return true
}, {
  message: "Documento inválido para o tipo selecionado",
  path: ["documento"]
})

/**
 * Schema para filtros de fornecedor
 */
export const fornecedorFiltersSchema = z.object({
  search: emptyStringToUndefined.optional(),
  tipoDocumento: z.enum(["CPF", "CNPJ"]).optional(),
  cidade: emptyStringToUndefined.optional(),
  estado: emptyStringToUndefined.optional()
})

// Tipos TypeScript inferidos dos schemas
export type FornecedorBaseData = z.infer<typeof fornecedorBaseSchema>
export type CreateFornecedorData = z.infer<typeof createFornecedorSchema>
export type UpdateFornecedorData = z.infer<typeof updateFornecedorSchema>
export type FornecedorFiltersData = z.infer<typeof fornecedorFiltersSchema>