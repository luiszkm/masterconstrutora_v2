# Integração com Módulo Financeiro

## Visão Geral

O módulo de Funcionários e Apontamentos está preparado para integração automática com o módulo Financeiro através de eventos e APIs. Esta documentação descreve como a integração funcionará quando implementada.

## Fluxo de Integração Atual

### 1. Aprovação de Apontamento
Quando um apontamento é aprovado através da action `aprovarApontamentoAction`:

1. **Status do Apontamento** muda para `APROVADO_PARA_PAGAMENTO`
2. **Evento** `pessoal:apontamento_aprovado` é disparado (futuro)
3. **Módulo Financeiro** escuta o evento e cria conta a pagar automaticamente
4. **Cache** é revalidado incluindo tag `contas-pagar`

### 2. Pagamento de Conta
Quando uma conta a pagar é quitada no módulo financeiro:

1. **Módulo Financeiro** dispara evento `financeiro:pagamento_realizado`
2. **Módulo Pessoal** escuta o evento e atualiza status do apontamento para `PAGO`
3. **Apontamento PAGO** não pode mais ser editado

## Pontos de Integração Preparados

### Actions Preparadas
- ✅ `aprovarApontamentoAction` - revalida cache financeiro
- ✅ Tratamento de erros específicos para regras de negócio
- ✅ Mensagens informativas sobre criação automática de contas

### Validações Implementadas
- ✅ Status de apontamento não permite edição quando `PAGO`
- ✅ Validação de regras de negócio no fluxo de aprovação
- ✅ Tratamento de conflitos de estado

### Cache e Revalidação
- ✅ Tags de cache preparadas: `contas-pagar`, `apontamentos`
- ✅ Revalidação cruzada entre módulos

## Dados Que Serão Enviados Para Conta a Pagar

### Estrutura do Evento `pessoal:apontamento_aprovado`
```json
{
  "apontamentoId": "uuid",
  "funcionarioId": "uuid", 
  "funcionarioNome": "João Silva",
  "funcionarioCpf": "12345678901",
  "chavePix": "joao@email.com",
  "valorTotal": 2100.00,
  "periodoInicio": "2025-01-01",
  "periodoFim": "2025-01-15",
  "descricao": "Pagamento quinzenal - João Silva (01/01/2025 - 15/01/2025)",
  "dataVencimento": "2025-01-22", // 7 dias após aprovação
  "categoria": "FUNCIONARIO",
  "tipo": "PAGAMENTO_FUNCIONARIO"
}
```

### Conta a Pagar Criada Automaticamente
```json
{
  "fornecedor": "João Silva",
  "cpfCnpj": "12345678901", 
  "tipo": "FUNCIONARIO",
  "descricao": "Pagamento de funcionário - João Silva (01/01/2025 - 15/01/2025)",
  "valor": 2100.00,
  "dataVencimento": "2025-01-22",
  "numeroDocumento": "apontamento-uuid",
  "chavePix": "joao@email.com",
  "categoria": "FOLHA_PAGAMENTO",
  "status": "PENDENTE",
  "metadata": {
    "apontamentoId": "uuid",
    "funcionarioId": "uuid",
    "moduloOrigem": "PESSOAL"
  }
}
```

## Eventos de Sistema (Para Implementação Futura)

### 1. Eventos Disparados pelo Módulo Pessoal
- `pessoal:apontamento_aprovado` - quando apontamento é aprovado
- `pessoal:apontamento_cancelado` - quando aprovação é cancelada
- `pessoal:funcionario_desligado` - quando funcionário é desligado

### 2. Eventos Escutados pelo Módulo Pessoal  
- `financeiro:pagamento_realizado` - quando conta é paga
- `financeiro:pagamento_cancelado` - quando pagamento é cancelado
- `financeiro:conta_vencida` - quando conta está vencida

## Implementação Futura

### 1. Sistema de Eventos
```typescript
// Serviço de eventos (a ser implementado)
export class EventBus {
  static async emit(eventName: string, payload: any) {
    // Implementar sistema de eventos/webhooks
  }
  
  static async listen(eventName: string, handler: Function) {
    // Implementar escuta de eventos
  }
}

// Uso na aprovação de apontamento
export async function aprovarApontamentoAction(apontamentoId: string) {
  // ... lógica atual ...
  
  // Disparar evento após aprovação
  await EventBus.emit('pessoal:apontamento_aprovado', {
    apontamentoId: apontamento.id,
    funcionarioId: apontamento.funcionarioId,
    // ... outros dados
  })
}
```

### 2. Listener para Eventos Financeiros
```typescript
// Listener para pagamentos (a ser implementado)
EventBus.listen('financeiro:pagamento_realizado', async (payload) => {
  const { apontamentoId } = payload.metadata
  
  if (apontamentoId) {
    // Atualizar status do apontamento para PAGO
    await atualizarStatusApontamento(apontamentoId, 'PAGO')
    
    // Revalidar cache
    revalidateTag(`apontamento-${apontamentoId}`)
    revalidateTag('funcionarios-apontamentos')
  }
})
```

## Configurações Necessárias

### Variáveis de Ambiente
```env
# Integração Financeira
ENABLE_FINANCIAL_INTEGRATION=true
FINANCIAL_API_URL=https://api.financeiro.com
FINANCIAL_API_KEY=xxx
WEBHOOK_SECRET=xxx
```

### Headers HTTP Para Eventos
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.FINANCIAL_API_KEY}`,
  'X-Module-Source': 'PESSOAL',
  'X-Webhook-Signature': signPayload(payload, process.env.WEBHOOK_SECRET)
}
```

## Monitoramento e Logs

### Logs Implementados
- ✅ Logs de aprovação de apontamentos
- ✅ Logs de erros de validação
- ✅ Logs de cache revalidation

### Logs Futuros
- ⏳ Logs de eventos disparados
- ⏳ Logs de eventos recebidos  
- ⏳ Logs de sincronização entre módulos
- ⏳ Alertas de falha na integração

## Tratamento de Erros

### Cenários de Erro Preparados
1. **Falha na Criação da Conta a Pagar**
   - Apontamento permanece como `APROVADO_PARA_PAGAMENTO`
   - Log de erro é gerado
   - Retry automático pode ser implementado

2. **Falha na Atualização de Status**
   - Sistema continua funcionando
   - Status é sincronizado na próxima operação
   - Alerta é enviado para administradores

3. **Inconsistência de Estado**
   - Mecanismo de reconciliação pode ser implementado
   - Relatórios de divergência são gerados

## Status da Implementação

### ✅ Implementado
- Estrutura de tipos TypeScript
- Actions com revalidação cruzada
- Schemas de validação
- Tratamento de erros específicos
- Documentação de integração

### ⏳ Pendente (Implementação Futura)
- Sistema de eventos/webhooks
- Listeners para eventos financeiros
- Interface de monitoramento
- Reconciliação automática de estados
- Testes de integração end-to-end

## Compatibilidade

Esta implementação é **backward compatible** com o sistema atual:
- Funções antigas continuam funcionando (marcadas como deprecated)
- Novos endpoints seguem documentação oficial
- Migração gradual é possível
- Rollback seguro está garantido