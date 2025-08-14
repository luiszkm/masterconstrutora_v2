import { describe, it, expect } from 'vitest'
import { loginSchema, type LoginFormData } from '../auth'

describe('Validação de Autenticação', () => {
  describe('loginSchema', () => {
    it('deve validar dados de login corretos', () => {
      const validData = {
        email: 'usuario@exemplo.com',
        password: '123456'
      }

      expect(() => loginSchema.parse(validData)).not.toThrow()
      
      const result = loginSchema.parse(validData)
      expect(result.email).toBe('usuario@exemplo.com')
      expect(result.password).toBe('123456')
    })

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        email: 'email-invalido',
        password: '123456'
      }

      expect(() => loginSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar senha muito curta', () => {
      const invalidData = {
        email: 'usuario@exemplo.com',
        password: '123'
      }

      expect(() => loginSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar dados faltantes', () => {
      expect(() => loginSchema.parse({ email: 'usuario@exemplo.com' })).toThrow()
      expect(() => loginSchema.parse({ password: '123456' })).toThrow()
      expect(() => loginSchema.parse({})).toThrow()
    })

    it('deve inferir tipo corretamente', () => {
      const data: LoginFormData = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Teste de tipo - se compilar, está correto
      expect(data.email).toBeTypeOf('string')
      expect(data.password).toBeTypeOf('string')
    })
  })
})