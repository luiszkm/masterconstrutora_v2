import { z } from "zod"
import { 
  valorMonetarioSchema,
  dateSchema,
  idSchema,
  emptyStringToUndefined,
  createFormDataSchema
} from "./common"

/**
 * Schema para conta a pagar
 */
export const contaPagarSchema = createFormDataSchema({
  fornecedorId: idSchema,
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  valor: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  dataVencimento: dateSchema,
  categoria: emptyStringToUndefined.optional(),
  observacoes: emptyStringToUndefined.optional(),
  obraId: emptyStringToUndefined.optional()
})

/**
 * Schema para conta a receber
 */
export const contaReceberSchema = createFormDataSchema({
  clienteId: idSchema,
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  valor: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  dataVencimento: dateSchema,
  categoria: emptyStringToUndefined.optional(),
  observacoes: emptyStringToUndefined.optional(),
  obraId: emptyStringToUndefined.optional()
})

/**
 * Schema para registro de pagamento
 */
export const registrarPagamentoSchema = createFormDataSchema({
  contaId: idSchema,
  valor: z.string().transform(val => Number(val.replace(/[^\d,]/g, '').replace(',', '.'))).pipe(valorMonetarioSchema),
  dataPagamento: dateSchema,
  formaPagamento: z.enum(["DINHEIRO", "CARTAO", "PIX", "TRANSFERENCIA", "CHEQUE"]),
  contaBancariaId: emptyStringToUndefined.optional(),
  observacoes: emptyStringToUndefined.optional()
})

/**
 * Schema para registro de recebimento
 */
export const registrarRecebimentoSchema = registrarPagamentoSchema

/**
 * Schema para filtros financeiros
 */
export const financeiroFiltersSchema = z.object({
  status: z.enum(["PENDENTE", "PAGO", "PARCIAL", "VENCIDO"]).optional(),
  categoria: emptyStringToUndefined.optional(),
  dataInicio: emptyStringToUndefined.pipe(dateSchema).optional(),
  dataFim: emptyStringToUndefined.pipe(dateSchema).optional(),
  fornecedorId: emptyStringToUndefined.optional(),
  clienteId: emptyStringToUndefined.optional(),
  obraId: emptyStringToUndefined.optional()
})

// Tipos TypeScript inferidos dos schemas
export type ContaPagarData = z.infer<typeof contaPagarSchema>
export type ContaReceberData = z.infer<typeof contaReceberSchema>
export type RegistrarPagamentoData = z.infer<typeof registrarPagamentoSchema>
export type RegistrarRecebimentoData = z.infer<typeof registrarRecebimentoSchema>
export type FinanceiroFiltersData = z.infer<typeof financeiroFiltersSchema>