# Schemas de Validação

Esta documentação descreve todos os schemas de validação implementados com Zod para garantir a integridade dos dados na aplicação Master Construtora.

## Índice

- [Visão Geral](#visão-geral)
- [Schemas Comuns](#schemas-comuns)
- [Autenticação](#autenticação)
- [Funcionários](#funcionários)
- [Obras](#obras)
- [Fornecedores](#fornecedores)
- [Orçamentos](#orçamentos)
- [Financeiro](#financeiro)
- [Como Usar](#como-usar)
- [Testes](#testes)

## Visão Geral

Os schemas de validação são organizados por domínio e utilizam Zod para validação em tempo de execução e inferência de tipos TypeScript.

### Estrutura de Arquivos

```
lib/validations/
├── common.ts          # Schemas reutilizáveis e helpers
├── auth.ts            # Validações de autenticação
├── funcionario.ts     # Validações de funcionários
├── obra.ts           # Validações de obras
├── fornecedor.ts     # Validações de fornecedores
├── orcamento.ts      # Validações de orçamentos
├── financeiro.ts     # Validações financeiras
└── __tests__/        # Testes unitários
```

## Schemas Comuns

### Validações Básicas

```typescript
import { emailSchema, cpfSchema, telefoneSchema } from '@/lib/validations/common'

// Validação de email
emailSchema.parse('usuario@exemplo.com') // ✅ válido
emailSchema.parse('email-invalido')       // ❌ erro

// Validação de CPF
cpfSchema.parse('123.456.789-10')    // ✅ válido
cpfSchema.parse('12345678910')       // ❌ erro (formato incorreto)

// Validação de telefone
telefoneSchema.parse('(11) 99999-9999') // ✅ válido
telefoneSchema.parse('11999999999')      // ❌ erro (formato incorreto)
```

### Schemas Disponíveis

| Schema | Descrição | Exemplo Válido |
|--------|-----------|----------------|
| `emailSchema` | Email válido | `usuario@dominio.com` |
| `cpfSchema` | CPF com formatação | `123.456.789-10` |
| `cnpjSchema` | CNPJ com formatação | `12.345.678/0001-90` |
| `telefoneSchema` | Telefone brasileiro | `(11) 99999-9999` |
| `cepSchema` | CEP brasileiro | `01234-567` |
| `nomeSchema` | Nome (2-100 chars) | `João Silva` |
| `valorMonetarioSchema` | Valor >= 0 | `100.50` |
| `percentualSchema` | Percentual 0-100 | `15.5` |
| `dateSchema` | Data ISO | `2023-12-25` |

### Helper Functions

#### `createFormDataSchema()`

Cria schemas que processam FormData automaticamente:

```typescript
const schema = createFormDataSchema({
  nome: nomeSchema,
  email: emptyStringToUndefined.pipe(emailSchema).optional()
})
```

#### `validateFormData()`

Valida FormData com tratamento de erros:

```typescript
const formData = new FormData()
formData.append('nome', 'João')
formData.append('email', 'joao@exemplo.com')

const result = validateFormData(formData, schema)

if (result.success) {
  console.log(result.data.nome) // 'João'
} else {
  console.log(result.errors) // { campo: ['mensagem de erro'] }
}
```

## Autenticação

### `loginSchema`

Validação para login de usuários:

```typescript
import { loginSchema } from '@/lib/validations/auth'

const dados = {
  email: 'usuario@exemplo.com',
  password: '123456'
}

const resultado = loginSchema.parse(dados)
```

**Regras:**
- Email deve ser válido
- Senha deve ter pelo menos 6 caracteres

## Funcionários

### Schemas Principais

- `createFuncionarioSchema` - Criação de funcionários
- `updateFuncionarioSchema` - Atualização (inclui ID)
- `funcionarioPaymentSchema` - Pagamentos

### Exemplo de Uso

```typescript
import { validateFormData } from '@/lib/validations/common'
import { createFuncionarioSchema } from '@/lib/validations/funcionario'

// Em uma Server Action
export async function criarFuncionario(formData: FormData) {
  const validation = validateFormData(formData, createFuncionarioSchema)
  
  if (!validation.success) {
    return createErrorResponse(
      Object.values(validation.errors)[0]?.[0] || "Dados inválidos"
    )
  }
  
  const funcionario = validation.data
  // ... lógica de criação
}
```

### Campos Validados

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `nome` | string | ✅ | 2-100 caracteres |
| `cpf` | string | ❌ | Formato: 000.000.000-00 |
| `email` | string | ❌ | Email válido |
| `telefone` | string | ❌ | Formato: (00) 00000-0000 |
| `cargo` | string | ❌ | Texto livre |
| `departamento` | string | ❌ | Texto livre |
| `dataContratacao` | string | ❌ | Formato: YYYY-MM-DD |
| `chavePix` | string | ❌ | Texto livre |
| `observacoes` | string | ❌ | Máx 1000 caracteres |

## Obras

### Schemas Principais

- `createObraSchema` - Criação de obras
- `updateObraSchema` - Atualização
- `associarFuncionariosSchema` - Associação de funcionários

### Exemplo

```typescript
import { createObraSchema } from '@/lib/validations/obra'

const dadosObra = {
  nome: 'Construção Residencial',
  cliente: 'João Silva',
  endereco: 'Rua das Flores, 123',
  dataInicio: '2023-01-15',
  dataFim: '2023-06-30',
  descricao: 'Casa de 3 quartos',
  orcamento: 150000.00,
  status: 'PLANEJAMENTO'
}
```

### Status Válidos

- `PLANEJAMENTO`
- `EM_ANDAMENTO`
- `PAUSADA`
- `CONCLUIDA`
- `CANCELADA`

## Fornecedores

### Schema Principal

- `createFornecedorSchema` - Criação/atualização

### Validação Condicional

O schema valida o documento baseado no tipo:

```typescript
{
  nome: 'Fornecedor ABC',
  tipoDocumento: 'CNPJ',
  documento: '12.345.678/0001-90', // Deve ser CNPJ válido
  email: 'contato@fornecedor.com'
}
```

**Regras:**
- Se `tipoDocumento` = "CPF" → `documento` deve ser CPF válido
- Se `tipoDocumento` = "CNPJ" → `documento` deve ser CNPJ válido

## Orçamentos

### Schemas Complexos

- `createOrcamentoSchema` - Orçamento completo
- `itemOrcamentoSchema` - Itens individuais
- `aprovarOrcamentoSchema` - Aprovação/rejeição

### Validação de Rejeição

```typescript
const dados = {
  id: 'orcamento-123',
  status: 'REJEITADO',
  motivoRejeicao: 'Preço acima do orçamento' // Obrigatório se rejeitado
}
```

## Financeiro

### Schemas de Transações

- `contaPagarSchema` - Contas a pagar
- `contaReceberSchema` - Contas a receber
- `registrarPagamentoSchema` - Registro de pagamentos

### Formas de Pagamento

```typescript
enum FormasPagamento {
  'DINHEIRO',
  'CARTAO',
  'PIX',
  'TRANSFERENCIA', 
  'CHEQUE'
}
```

## Como Usar

### 1. Em Server Actions

```typescript
"use server"

import { validateFormData } from '@/lib/validations/common'
import { createFornecedorSchema } from '@/lib/validations/fornecedor'
import { createErrorResponse, createSuccessResponse } from '@/types/action-responses'

export async function criarFornecedor(formData: FormData) {
  // Validação automática
  const validation = validateFormData(formData, createFornecedorSchema)
  
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0]
    return createErrorResponse(firstError || "Dados inválidos")
  }
  
  const fornecedor = validation.data
  // ... resto da lógica
}
```

### 2. Em Componentes Cliente

```typescript
"use client"

import { useActionState } from 'react'
import { criarFornecedor } from '@/app/actions/fornecedor'

export function FormFornecedor() {
  const [state, formAction, isPending] = useActionState(criarFornecedor, null)
  
  return (
    <form action={formAction}>
      {/* Se houver erros de validação, exibir */}
      {!state?.success && state?.message && (
        <div className="error">{state.message}</div>
      )}
      
      {/* Campos do formulário */}
      <input name="nome" required />
      <input name="email" type="email" />
      {/* ... */}
    </form>
  )
}
```

### 3. Validação Manual

```typescript
import { nomeSchema, emailSchema } from '@/lib/validations/common'

try {
  const nome = nomeSchema.parse('João Silva')
  const email = emailSchema.parse('joao@exemplo.com')
  // Dados válidos
} catch (error) {
  console.error('Erro de validação:', error.errors)
}
```

## Testes

Os schemas possuem testes unitários abrangentes em `lib/validations/__tests__/`.

### Executar Testes

```bash
npm run test            # Modo watch
npm run test:run        # Execução única
npm run test:ui         # Interface visual
```

### Estrutura dos Testes

- ✅ **Casos válidos** - Dados que devem passar na validação
- ❌ **Casos inválidos** - Dados que devem falhar
- 🔄 **Transformações** - Conversões automáticas (ex: strings vazias → undefined)
- 📝 **Inferência de tipos** - Verificação de tipos TypeScript

### Cobertura

- [x] Schemas comuns (17 testes)
- [x] Autenticação (5 testes)  
- [x] Action responses (10 testes)
- [x] Funcionários
- [x] Obras
- [x] Fornecedores
- [x] Orçamentos
- [x] Financeiro

## Boas Práticas

### 1. Sempre Validar FormData

```typescript
// ✅ Correto
const validation = validateFormData(formData, schema)
if (!validation.success) {
  return createErrorResponse("Dados inválidos")
}

// ❌ Incorreto
const nome = formData.get('nome') as string
```

### 2. Usar Tipos Inferidos

```typescript
import { type CreateFuncionarioData } from '@/lib/validations/funcionario'

// Tipo automaticamente inferido do schema
function processarFuncionario(data: CreateFuncionarioData) {
  // data.nome é string
  // data.email é string | undefined
}
```

### 3. Tratar Strings Vazias

Os schemas automaticamente convertem strings vazias em `undefined`:

```typescript
// FormData: { nome: 'João', email: '' }
// Resultado: { nome: 'João', email: undefined }
```

### 4. Mensagens de Erro Customizadas

```typescript
const schema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres")
```

### 5. Validação Condicional

```typescript
const schema = z.object({
  tipo: z.enum(['PESSOA', 'EMPRESA']),
  documento: z.string()
}).refine((data) => {
  if (data.tipo === 'PESSOA') {
    return cpfSchema.safeParse(data.documento).success
  }
  return cnpjSchema.safeParse(data.documento).success
}, {
  message: "Documento inválido para o tipo selecionado",
  path: ["documento"]
})
```

---

## Contribuindo

Ao adicionar novos schemas:

1. **Criar o schema** em `lib/validations/[dominio].ts`
2. **Exportar tipos** TypeScript inferidos
3. **Escrever testes** em `__tests__/[dominio].test.ts`
4. **Documentar** neste arquivo
5. **Aplicar** nas Server Actions correspondentes

Para dúvidas ou sugestões, consulte a equipe de desenvolvimento.