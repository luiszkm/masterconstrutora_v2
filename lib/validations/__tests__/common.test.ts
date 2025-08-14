import { describe, it, expect } from 'vitest'
import { 
  emailSchema, 
  cpfSchema, 
  telefoneSchema, 
  cepSchema, 
  cnpjSchema,
  nomeSchema,
  valorMonetarioSchema,
  validateFormData
} from '../common'
import { z } from 'zod'

describe('Validações Comuns', () => {
  describe('emailSchema', () => {
    it('deve validar emails corretos', () => {
      expect(() => emailSchema.parse('teste@exemplo.com')).not.toThrow()
      expect(() => emailSchema.parse('usuario+tag@dominio.co.uk')).not.toThrow()
    })

    it('deve rejeitar emails inválidos', () => {
      expect(() => emailSchema.parse('email-invalido')).toThrow()
      expect(() => emailSchema.parse('sem@dominio')).toThrow()
      expect(() => emailSchema.parse('')).toThrow()
    })
  })

  describe('cpfSchema', () => {
    it('deve validar CPFs com formato correto', () => {
      expect(() => cpfSchema.parse('123.456.789-10')).not.toThrow()
      expect(() => cpfSchema.parse('000.000.000-00')).not.toThrow()
    })

    it('deve rejeitar CPFs com formato incorreto', () => {
      expect(() => cpfSchema.parse('12345678910')).toThrow()
      expect(() => cpfSchema.parse('123.456.789-1')).toThrow()
      expect(() => cpfSchema.parse('123-456-789-10')).toThrow()
    })
  })

  describe('telefoneSchema', () => {
    it('deve validar telefones com formato correto', () => {
      expect(() => telefoneSchema.parse('(11) 99999-9999')).not.toThrow()
      expect(() => telefoneSchema.parse('(21) 3333-3333')).not.toThrow()
    })

    it('deve rejeitar telefones com formato incorreto', () => {
      expect(() => telefoneSchema.parse('11999999999')).toThrow()
      expect(() => telefoneSchema.parse('(11) 999999999')).toThrow()
      expect(() => telefoneSchema.parse('11 99999-9999')).toThrow()
    })
  })

  describe('cepSchema', () => {
    it('deve validar CEPs com formato correto', () => {
      expect(() => cepSchema.parse('01234-567')).not.toThrow()
      expect(() => cepSchema.parse('99999-999')).not.toThrow()
    })

    it('deve rejeitar CEPs com formato incorreto', () => {
      expect(() => cepSchema.parse('01234567')).toThrow()
      expect(() => cepSchema.parse('0123-4567')).toThrow()
      expect(() => cepSchema.parse('012345-67')).toThrow()
    })
  })

  describe('cnpjSchema', () => {
    it('deve validar CNPJs com formato correto', () => {
      expect(() => cnpjSchema.parse('12.345.678/0001-90')).not.toThrow()
      expect(() => cnpjSchema.parse('00.000.000/0000-00')).not.toThrow()
    })

    it('deve rejeitar CNPJs com formato incorreto', () => {
      expect(() => cnpjSchema.parse('12345678000190')).toThrow()
      expect(() => cnpjSchema.parse('12.345.678/0001-9')).toThrow()
      expect(() => cnpjSchema.parse('12-345-678/0001-90')).toThrow()
    })
  })

  describe('nomeSchema', () => {
    it('deve validar nomes corretos', () => {
      expect(() => nomeSchema.parse('João Silva')).not.toThrow()
      expect(() => nomeSchema.parse('Maria')).not.toThrow()
    })

    it('deve rejeitar nomes muito curtos ou muito longos', () => {
      expect(() => nomeSchema.parse('A')).toThrow()
      expect(() => nomeSchema.parse('')).toThrow()
      expect(() => nomeSchema.parse('A'.repeat(101))).toThrow()
    })
  })

  describe('valorMonetarioSchema', () => {
    it('deve validar valores monetários corretos', () => {
      expect(() => valorMonetarioSchema.parse(0)).not.toThrow()
      expect(() => valorMonetarioSchema.parse(100.50)).not.toThrow()
      expect(() => valorMonetarioSchema.parse(1000000)).not.toThrow()
    })

    it('deve rejeitar valores negativos', () => {
      expect(() => valorMonetarioSchema.parse(-10)).toThrow()
      expect(() => valorMonetarioSchema.parse(-0.01)).toThrow()
    })
  })

  describe('validateFormData', () => {
    const testSchema = z.object({
      nome: nomeSchema,
      email: emailSchema.optional()
    })

    it('deve validar FormData válido', () => {
      const formData = new FormData()
      formData.append('nome', 'João Silva')
      formData.append('email', 'joao@exemplo.com')

      const result = validateFormData(formData, testSchema)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nome).toBe('João Silva')
        expect(result.data.email).toBe('joao@exemplo.com')
      }
    })

    it('deve retornar erros para FormData inválido', () => {
      const formData = new FormData()
      formData.append('nome', 'A') // Nome muito curto
      formData.append('email', 'email-invalido')

      const result = validateFormData(formData, testSchema)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.nome).toContain('Nome deve ter pelo menos 2 caracteres')
        expect(result.errors.email).toContain('Email inválido')
      }
    })

    it('deve converter strings vazias em undefined', () => {
      const formData = new FormData()
      formData.append('nome', 'João Silva')
      formData.append('email', '') // String vazia

      const result = validateFormData(formData, testSchema)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nome).toBe('João Silva')
        expect(result.data.email).toBeUndefined()
      }
    })
  })
})