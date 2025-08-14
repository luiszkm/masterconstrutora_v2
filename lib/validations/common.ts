import { z } from "zod"

/**
 * Schemas de validação comuns para toda a aplicação
 */

// Validações de base
export const emailSchema = z.string().email("Email inválido")
export const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00")
export const telefoneSchema = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (00) 00000-0000")
export const cepSchema = z.string().regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000")
export const cnpjSchema = z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ deve estar no formato 00.000.000/0000-00")

// Validações de data
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
export const dateTimeSchema = z.string().datetime("Data e hora inválidas")

// Validações monetárias
export const valorMonetarioSchema = z.number().min(0, "Valor deve ser maior ou igual a zero")
export const percentualSchema = z.number().min(0).max(100, "Percentual deve estar entre 0 e 100")

// Validações de texto
export const nomeSchema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres")
export const descricaoSchema = z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional()
export const observacoesSchema = z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").optional()

// Validações de ID
export const idSchema = z.string().min(1, "ID é obrigatório")
export const optionalIdSchema = z.string().optional()

// Status comuns
export const statusSchema = z.enum(["ATIVO", "INATIVO", "PENDENTE", "CONCLUIDO", "CANCELADO"])

// Helper para transformar strings vazias em undefined
export const emptyStringToUndefined = z.literal("").transform(() => undefined).or(z.string())

/**
 * Schema base para validação de FormData
 */
export function createFormDataSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).transform((data) => {
    // Converter strings vazias em undefined
    const cleaned = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.trim() === '') {
        acc[key as keyof typeof data] = undefined as any
      } else {
        acc[key as keyof typeof data] = value
      }
      return acc
    }, {} as typeof data)
    
    return cleaned
  })
}

/**
 * Helper para validar FormData com schema Zod
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    // Converter FormData para object
    const rawData = Object.fromEntries(formData.entries())
    
    // Converter strings vazias em undefined
    const data = Object.entries(rawData).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.trim() === '') {
        acc[key] = undefined
      } else {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>)
    
    // Validar com schema
    const result = schema.parse(data)
    
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      return { success: false, errors }
    }
    
    throw error
  }
}