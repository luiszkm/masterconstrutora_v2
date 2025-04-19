# Entidades do Sistema Master Construtora

Este documento descreve todas as entidades do sistema, suas propriedades e tipos para facilitar a implementação do backend.

## Índice
- [Usuário](#usuário)
- [Funcionário](#funcionário)
- [Fornecedor](#fornecedor)
- [Material](#material)
- [Obra](#obra)
- [Orçamento](#orçamento)
- [Pagamento (Funcionário)](#pagamento-funcionário)
- [Pagamento (Orçamento)](#pagamento-orçamento)
- [Conta Bancária](#conta-bancária)
- [Cliente](#cliente)
- [Etapa de Obra](#etapa-de-obra)
- [Material de Orçamento](#material-de-orçamento)

## Usuário

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do usuário |
| nome | string | Nome completo do usuário |
| email | string | Email do usuário (usado para login) |
| senha | string | Senha do usuário (armazenada com hash) |
| cargo | string | Cargo do usuário no sistema |
| permissoes | string[] | Lista de permissões do usuário |
| dataCriacao | Date | Data de criação do usuário |
| ultimoAcesso | Date | Data do último acesso do usuário |
| ativo | boolean | Status do usuário (ativo/inativo) |

## Funcionário

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do funcionário |
| nome | string | Nome completo do funcionário |
| cpf | string | CPF do funcionário |
| email | string | Email do funcionário |
| telefone | string | Telefone do funcionário |
| cargo | string | Cargo do funcionário |
| departamento | string | Departamento do funcionário |
| dataContratacao | string | Data de contratação (formato: "YYYY-MM-DD") |
| dataDemissao | string \| null | Data de demissão, se aplicável |
| salario | number | Salário do funcionário |
| diaria | number | Valor da diária do funcionário |
| diasTrabalhados | number | Número de dias trabalhados no período atual |
| valorAdicional | number | Valor adicional a ser pago |
| descontos | number | Valor de descontos |
| adiantamento | number | Valor de adiantamento |
| chavePix | string | Chave PIX para pagamento |
| avaliacao | number | Avaliação do funcionário (1-5) |
| observacao | string | Observações sobre o funcionário |
| status | string | Status do funcionário (Ativo, Inativo, Férias, Licença) |
| ultimoComprovante | string \| null | Nome do arquivo do último comprovante de pagamento |
| obras | number[] | IDs das obras em que o funcionário trabalha/trabalhou |

## Fornecedor

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do fornecedor |
| nome | string | Nome da empresa fornecedora |
| cnpj | string | CNPJ do fornecedor |
| categoria | string | Categoria do fornecedor |
| website | string | Website do fornecedor |
| endereco | string | Endereço completo |
| cidade | string | Cidade |
| estado | string | Estado (UF) |
| cep | string | CEP |
| contato | string | Nome da pessoa de contato |
| cargo | string | Cargo da pessoa de contato |
| email | string | Email de contato |
| telefone | string | Telefone de contato |
| avaliacao | number | Avaliação do fornecedor (1-5) |
| observacoes | string | Observações sobre o fornecedor |
| status | string | Status do fornecedor (Ativo, Inativo) |
| materiais | MaterialTipo[] | Lista de materiais fornecidos |
| orcamentos | number | Número de orçamentos associados |

## MaterialTipo

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do tipo de material |
| nome | string | Nome do tipo de material |

## Material

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do material |
| codigo | string | Código do material |
| nome | string | Nome do material |
| categoria | string | Categoria do material |
| unidade | string | Unidade de medida |
| preco | number | Preço unitário |
| estoque | number | Quantidade em estoque |
| fornecedor | string | Nome do fornecedor |
| status | string | Status do material (Disponível, Baixo Estoque) |
| estoqueMinimo | number | Quantidade mínima de estoque |
| localizacao | string | Localização no depósito |
| descricao | string | Descrição detalhada do material |

## Obra

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único da obra |
| nome | string | Nome da obra |
| cliente | string | Nome do cliente |
| endereco | string | Endereço da obra |
| dataInicio | string | Data de início (formato: "DD/MM/YYYY") |
| dataFim | string | Data de conclusão prevista (formato: "DD/MM/YYYY") |
| status | string | Status da obra (Em andamento, Concluída) |
| responsavel | string | Nome do responsável técnico |
| descricao | string | Descrição detalhada da obra |
| orcamentos | Orcamento[] | Lista de orçamentos associados |
| fornecedores | FornecedorObra[] | Lista de fornecedores da obra |
| funcionarios | FuncionarioObra[] | Lista de funcionários da obra |
| etapas | EtapaObra[] | Lista de etapas da obra |

## FornecedorObra

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do fornecedor |
| nome | string | Nome do fornecedor |
| tipo | string | Tipo de fornecimento |
| contato | string | Informações de contato |

## FuncionarioObra

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do funcionário |
| nome | string | Nome do funcionário |
| cargo | string | Cargo do funcionário |
| periodo | string | Período de trabalho na obra |
| avatar | string \| null | URL da imagem de avatar |

## Etapa de Obra

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único da etapa |
| etapa | string | Nome da etapa |
| inicio | string | Data de início (formato: "YYYY-MM-DD") |
| fim | string | Data de conclusão prevista (formato: "YYYY-MM-DD") |
| progresso | number | Percentual de progresso (0-100) |

## Orçamento

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do orçamento |
| numero | string | Número do orçamento |
| cliente | string | Nome do cliente |
| obra | string | Nome da obra |
| dataEmissao | string | Data de emissão (formato: "YYYY-MM-DD") |
| dataAprovacao | string | Data de aprovação (formato: "YYYY-MM-DD") |
| dataPagamento | string \| null | Data de pagamento, se aplicável |
| valor | number | Valor total do orçamento |
| status | string | Status do orçamento (Aprovado, Pago) |
| formaPagamento | string \| null | Forma de pagamento, se aplicável |
| contaBancaria | string \| null | Conta bancária utilizada, se aplicável |
| materiais | MaterialOrcamento[] | Lista de materiais incluídos no orçamento |
| responsavel | string | Nome do responsável pelo orçamento |
| observacoes | string | Observações sobre o orçamento |

## Material de Orçamento

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do material no orçamento |
| nome | string | Nome do material |
| quantidade | number | Quantidade do material |
| unidade | string | Unidade de medida |
| valorUnitario | number | Valor unitário |
| valorTotal | number | Valor total (quantidade * valorUnitario) |
| fornecedor | string | Nome do fornecedor |

## Pagamento (Funcionário)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do pagamento |
| funcionarioId | number | ID do funcionário |
| funcionario | { id: number, nome: string, cargo: string, avatar: string \| null } | Dados do funcionário |
| data | string | Data do pagamento (formato: "YYYY-MM-DD") |
| valor | number | Valor do pagamento |
| tipo | string | Tipo de pagamento (Salário Quinzenal, Salário Mensal, etc.) |
| contaBancaria | string \| null | Conta bancária utilizada |
| observacao | string | Observações sobre o pagamento |
| status | string | Status do pagamento (Pendente, Pago) |
| comprovante | string \| null | Nome do arquivo do comprovante |
| quinzena | string | Período de referência do pagamento |
| diasTrabalhados | number | Número de dias trabalhados |
| valorAdicional | number | Valor adicional |
| descontos | number | Valor de descontos |
| adiantamento | number | Valor de adiantamento |

## Pagamento (Orçamento)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do pagamento |
| orcamentoId | number | ID do orçamento |
| data | string | Data do pagamento (formato: "YYYY-MM-DD") |
| valor | number | Valor do pagamento |
| formaPagamento | string | Forma de pagamento |
| contaBancaria | string | Conta bancária utilizada |
| comprovante | string \| null | Nome do arquivo do comprovante |
| observacoes | string | Observações sobre o pagamento |

## Conta Bancária

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único da conta |
| nome | string | Nome da conta |
| agencia | string | Número da agência |
| conta | string | Número da conta |
| tipo | string | Tipo de conta (Conta Corrente, Conta Poupança, Conta Investimento) |
| saldo | number | Saldo atual |

## Cliente

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| id | number | Identificador único do cliente |
| nome | string | Nome do cliente |
| tipo | string | Tipo de cliente (Pessoa Física, Pessoa Jurídica) |
| documento | string | CPF ou CNPJ |
| email | string | Email do cliente |
| telefone | string | Telefone do cliente |
| endereco | string | Endereço completo |
| cidade | string | Cidade |
| estado | string | Estado (UF) |
| cep | string | CEP |
| observacoes | string | Observações sobre o cliente |
| obras | number[] | IDs das obras associadas ao cliente |
| orcamentos | number[] | IDs dos orçamentos associados ao cliente |

## Relacionamentos entre Entidades

### Funcionário - Obra
- Um funcionário pode trabalhar em várias obras
- Uma obra pode ter vários funcionários

### Fornecedor - Material
- Um fornecedor pode fornecer vários materiais
- Um material pode ser fornecido por vários fornecedores

### Fornecedor - Obra
- Um fornecedor pode fornecer para várias obras
- Uma obra pode ter vários fornecedores

### Obra - Orçamento
- Uma obra pode ter vários orçamentos
- Um orçamento pertence a uma obra

### Cliente - Obra
- Um cliente pode ter várias obras
- Uma obra pertence a um cliente

### Orçamento - Material
- Um orçamento pode conter vários materiais
- Um material pode estar em vários orçamentos

### Funcionário - Pagamento
- Um funcionário pode receber vários pagamentos
- Um pagamento pertence a um funcionário

### Orçamento - Pagamento
- Um orçamento pode ter um pagamento
- Um pagamento pertence a um orçamento

### Conta Bancária - Pagamento
- Uma conta bancária pode ter vários pagamentos
- Um pagamento é feito a partir de uma conta bancária
