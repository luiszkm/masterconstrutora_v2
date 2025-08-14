import { describe, it, expect } from 'vitest'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  type ActionResponse,
  type CreateActionResponse,
  type ValidationActionResponse
} from '../action-responses'

describe('Action Responses', () => {
  describe('createSuccessResponse', () => {
    it('deve criar resposta de sucesso básica', () => {
      const response = createSuccessResponse('Operação realizada com sucesso')
      
      expect(response).toEqual({
        success: true,
        message: 'Operação realizada com sucesso',
        data: undefined
      })
    })

    it('deve criar resposta de sucesso com dados', () => {
      const data = { id: '123', nome: 'Teste' }
      const response = createSuccessResponse('Item criado', data)
      
      expect(response).toEqual({
        success: true,
        message: 'Item criado',
        data: data
      })
    })

    it('deve inferir tipos corretamente', () => {
      const response: ActionResponse<{ id: string }> = createSuccessResponse(
        'Item criado', 
        { id: '123' }
      )
      
      expect(response.data?.id).toBe('123')
    })
  })

  describe('createErrorResponse', () => {
    it('deve criar resposta de erro básica', () => {
      const response = createErrorResponse('Erro ao processar solicitação')
      
      expect(response).toEqual({
        success: false,
        message: 'Erro ao processar solicitação',
        error: undefined,
        data: null
      })
    })

    it('deve criar resposta de erro com detalhes', () => {
      const response = createErrorResponse(
        'Erro de validação', 
        'Campo obrigatório não informado'
      )
      
      expect(response).toEqual({
        success: false,
        message: 'Erro de validação',
        error: 'Campo obrigatório não informado',
        data: null
      })
    })
  })

  describe('createValidationErrorResponse', () => {
    it('deve criar resposta de erro de validação', () => {
      const validationErrors = {
        nome: ['Nome é obrigatório'],
        email: ['Email inválido', 'Email já cadastrado']
      }
      
      const response = createValidationErrorResponse(
        'Dados inválidos',
        validationErrors
      )
      
      expect(response).toEqual({
        success: false,
        message: 'Dados inválidos',
        validationErrors,
        data: null
      })
    })

    it('deve ter tipo correto', () => {
      const validationErrors = { email: ['Inválido'] }
      const response: ValidationActionResponse = createValidationErrorResponse(
        'Erro',
        validationErrors
      )
      
      expect(response.validationErrors).toEqual(validationErrors)
    })
  })

  describe('Tipos de Interface', () => {
    it('ActionResponse deve aceitar diferentes tipos de data', () => {
      const stringResponse: ActionResponse<string> = {
        success: true,
        message: 'Ok',
        data: 'resultado'
      }
      
      const objectResponse: ActionResponse<{ id: number }> = {
        success: true,
        message: 'Ok',
        data: { id: 123 }
      }
      
      expect(stringResponse.data).toBe('resultado')
      expect(objectResponse.data?.id).toBe(123)
    })

    it('CreateActionResponse deve ter campo id', () => {
      const response: CreateActionResponse<string> = {
        success: true,
        message: 'Criado',
        data: 'dados',
        id: 'novo-id'
      }
      
      expect(response.id).toBe('novo-id')
    })

    it('ValidationActionResponse deve ter validationErrors', () => {
      const response: ValidationActionResponse = {
        success: false,
        message: 'Erro',
        data: null,
        validationErrors: {
          campo: ['Erro no campo']
        }
      }
      
      expect(response.validationErrors).toBeDefined()
      expect(response.validationErrors?.campo).toContain('Erro no campo')
    })
  })
})