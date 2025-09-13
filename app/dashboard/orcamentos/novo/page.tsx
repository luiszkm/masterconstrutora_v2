"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputMonetario } from "@/components/ui/input-monetario"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Loader2, Building, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { cn } from "@/app/lib/utils"
import { createOrcamento, getFornecedores, getCategorias, getObras, getEtapasByObra } from "@/app/actions/orcamento"
import type { FornecedorOrcamento } from "@/types/fornecedor"

// Tipo para categoria da API
type Categoria = {
  ID: string
  Nome: string
  createdAt: string
  updatedAt: string
}

// Tipo para obra da API
type Obra = {
  id: string
  nome: string
  cliente: string
  status: string
  etapa: string
  evolucao: string
}

// Tipo para etapa da API
type Etapa = {
  ID: string
  Nome: string
  // outros campos da etapa se necessário
}

// Tipo para item do orçamento baseado no payload da API
type ItemOrcamento = {
  id: string // ID temporário para controle local
  nomeProduto: string
  unidadeDeMedida: string
  categoria: string
  quantidade: number
  valorUnitario: number
  valorTotal: number // calculado localmente
}

// Unidades de medida disponíveis
const unidadesMedida = [
  "saco",
  "barra",
  "m³",
  "m²",
  "m",
  "kg",
  "un",
  "L",
  "rolo",
  "pacote",
  "caixa",
  "peça",
  "conjunto",
]

// Condições de pagamento
const condicoesPagamento = [
  "À vista",
  "15 dias",
  "30 dias",
  "45 dias",
  "60 dias",
  "90 dias",
  "Parcelado em 2x",
  "Parcelado em 3x",
  "Personalizado",
]

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Estados para dados da API
  const [obras, setObras] = useState<Obra[]>([])
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [fornecedores, setFornecedores] = useState<FornecedorOrcamento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingObras, setLoadingObras] = useState(true)
  const [loadingEtapas, setLoadingEtapas] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingFornecedores, setLoadingFornecedores] = useState(true)

  // Estados para seleção de obra e etapa
  const [obraSelecionada, setObraSelecionada] = useState("")
  const [etapaSelecionada, setEtapaSelecionada] = useState("")

  // Estados para formulário
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("")
  const [condicoesPagamentoSelecionada, setCondicoesPagamentoSelecionada] = useState("")
  const [observacoes, setObservacoes] = useState("")

  // Estados para itens
  const [itens, setItens] = useState<ItemOrcamento[]>([
    {
      id: "1",
      nomeProduto: "",
      unidadeDeMedida: "",
      categoria: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    },
  ])

  // Estados para popovers
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null)
  const [categoriaPesquisa, setCategoriaPesquisa] = useState("")
  const [unidadeAberta, setUnidadeAberta] = useState<string | null>(null)
  const [unidadePesquisa, setUnidadePesquisa] = useState("")

  // Carregar obras e dados iniciais
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [obrasData, fornecedoresData, categoriasData] = await Promise.all([
          getObras(),
          getFornecedores(),
          getCategorias(),
        ])

        if (!("error" in obrasData)) {
          setObras(obrasData)
        } else {
          toast({
            title: "Erro ao carregar obras",
            description: obrasData.error,
            variant: "destructive",
          })
        }

        if (!("error" in fornecedoresData)) {
          setFornecedores(Array.isArray(fornecedoresData) ? fornecedoresData : [])
        } else {
          toast({
            title: "Erro ao carregar fornecedores",
            description: fornecedoresData.error,
            variant: "destructive",
          })
        }

        if (!("error" in categoriasData)) {
          setCategorias(Array.isArray(categoriasData) ? categoriasData : [])
        } else {
          toast({
            title: "Erro ao carregar categorias",
            description: categoriasData.error,
            variant: "destructive",
          })
          setCategorias([])
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        })
      } finally {
        setLoadingObras(false)
        setLoadingData(false)
        setLoadingFornecedores(false)
      }
    }

    loadInitialData()
  }, [])

  // Carregar etapas quando uma obra for selecionada
  useEffect(() => {
    async function loadEtapas() {
      if (!obraSelecionada) {
        setEtapas([])
        setEtapaSelecionada("")
        return
      }

      setLoadingEtapas(true)
      try {
        const etapasData = await getEtapasByObra(obraSelecionada)

        if (!("error" in etapasData)) {
          setEtapas(Array.isArray(etapasData) ? etapasData : [])
        } else {
          toast({
            title: "Erro ao carregar etapas",
            description: etapasData.error,
            variant: "destructive",
          })
          setEtapas([])
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar etapas",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        })
        setEtapas([])
      } finally {
        setLoadingEtapas(false)
      }
    }

    loadEtapas()
  }, [obraSelecionada])

  // Limpar etapa selecionada quando obra mudar
  useEffect(() => {
    setEtapaSelecionada("")
  }, [obraSelecionada])

  // Função para adicionar um novo item
  const adicionarItem = () => {
    const novoItem: ItemOrcamento = {
      id: Date.now().toString(),
      nomeProduto: "",
      unidadeDeMedida: "",
      categoria: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    }
    setItens([...itens, novoItem])
  }

  // Função para remover um item
  const removerItem = (id: string) => {
    setItens(itens.filter((item) => item.id !== id))
  }

  // Função para atualizar um item
  const atualizarItem = (id: string, campo: keyof ItemOrcamento, valor: any) => {
    setItens(
      itens.map((item) => {
        if (item.id === id) {
          const itemAtualizado = { ...item, [campo]: valor }
          // Recalcular valor total se quantidade ou valor unitário mudar
          if (campo === "quantidade" || campo === "valorUnitario") {
            itemAtualizado.valorTotal = itemAtualizado.quantidade * itemAtualizado.valorUnitario
          }
          return itemAtualizado
        }
        return item
      }),
    )
  }

  // Cálculos
  const calcularSubtotal = () => itens.reduce((total, item) => total + item.valorTotal, 0)
  const calcularTotal = () => calcularSubtotal()

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!etapaSelecionada) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma obra e etapa",
        variant: "destructive",
      })
      return
    }

    if (!fornecedorSelecionado) {
      toast({
        title: "Erro de validação",
        description: "Selecione um fornecedor",
        variant: "destructive",
      })
      return
    }

    if (!condicoesPagamentoSelecionada) {
      toast({
        title: "Erro de validação",
        description: "Selecione as condições de pagamento",
        variant: "destructive",
      })
      return
    }

    // Validar itens
    const itensValidos = itens.filter(
      (item) =>
        item.nomeProduto && item.unidadeDeMedida && item.categoria && item.quantidade > 0 && item.valorUnitario > 0,
    )

    if (itensValidos.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Adicione pelo menos um item válido",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      // Preparar dados conforme o payload da API
      const orcamentoData = {
        fornecedorId: fornecedorSelecionado,
        itens: itensValidos.map((item) => ({
          nomeProduto: item.nomeProduto,
          unidadeDeMedida: item.unidadeDeMedida,
          categoria: item.categoria,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        })),
        condicoesPagamento: condicoesPagamentoSelecionada,
        observacoes: observacoes || undefined,
      }

      const result = await createOrcamento(etapaSelecionada, orcamentoData)

      if (result.success) {
        toast({
          title: "Orçamento criado",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        router.push("/dashboard/orcamentos")
      } else {
        toast({
          title: "Erro ao criar orçamento",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  if (loadingData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Novo Orçamento</h2>
          <p className="text-muted-foreground">Selecione a obra e etapa para criar o orçamento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Obra e Etapa */}
        <Card>
          <CardHeader>
            <CardTitle>Obra e Etapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obra">Obra *</Label>
                <div className="relative">
                  <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select value={obraSelecionada} onValueChange={setObraSelecionada} required disabled={loadingObras}>
                    <SelectTrigger id="obra" className="pl-8">
                      <SelectValue placeholder={loadingObras ? "Carregando obras..." : "Selecione a obra"} />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{obra.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {obra.cliente} • {obra.status} • {obra.evolucao}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="etapa">Etapa *</Label>
                <div className="relative">
                  <Layers className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={etapaSelecionada}
                    onValueChange={setEtapaSelecionada}
                    required
                    disabled={!obraSelecionada || loadingEtapas}
                  >
                    <SelectTrigger id="etapa" className="pl-8">
                      <SelectValue
                        placeholder={
                          !obraSelecionada
                            ? "Selecione uma obra primeiro"
                            : loadingEtapas
                              ? "Carregando etapas..."
                              : "Selecione a etapa"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {etapas.map((etapa) => (
                        <SelectItem key={etapa.ID} value={etapa.ID}>
                          {etapa.Nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {obraSelecionada && etapas.length === 0 && !loadingEtapas && (
              <p className="text-sm text-muted-foreground">Nenhuma etapa encontrada para esta obra.</p>
            )}
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor *</Label>
                <Select
                  value={fornecedorSelecionado}
                  onValueChange={setFornecedorSelecionado}
                  required
                  disabled={loadingFornecedores}
                >
                  <SelectTrigger id="fornecedor">
                    <SelectValue
                      placeholder={loadingFornecedores ? "Carregando fornecedores..." : "Selecione o fornecedor"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!Array.isArray(fornecedores) || fornecedores.length === 0 ? (
                      <SelectItem value="" disabled>
                        {loadingFornecedores ? "Carregando..." : "Nenhum fornecedor encontrado"}
                      </SelectItem>
                    ) : (
                      fornecedores.map((fornecedor) => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{fornecedor.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {Array.isArray(fornecedor.categorias) && fornecedor.categorias.length > 0 ? fornecedor.categorias.map((cat) => cat?.Nome || "").filter(nome => nome).join(", ") : "N/A"} • {fornecedor.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condicoesPagamento">Condições de Pagamento *</Label>
                <Select value={condicoesPagamentoSelecionada} onValueChange={setCondicoesPagamentoSelecionada} required>
                  <SelectTrigger id="condicoesPagamento">
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    {condicoesPagamento.map((condicao) => (
                      <SelectItem key={condicao} value={condicao}>
                        {condicao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itens do Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle>Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Nome do Produto</TableHead>
                      <TableHead className="min-w-[150px]">Categoria</TableHead>
                      <TableHead className="min-w-[120px]">Unidade</TableHead>
                      <TableHead className="min-w-[100px]">Quantidade</TableHead>
                      <TableHead className="min-w-[140px]">Valor Unitário</TableHead>
                      <TableHead className="min-w-[120px]">Valor Total</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.nomeProduto}
                            onChange={(e) => atualizarItem(item.id, "nomeProduto", e.target.value)}
                            placeholder="Ex: Cimento Votoran CP II 50kg"
                            className="min-w-[200px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Popover
                            open={categoriaAberta === item.id}
                            onOpenChange={(open) => {
                              setCategoriaAberta(open ? item.id : null)
                              if (!open) setCategoriaPesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={categoriaAberta === item.id}
                                className="w-full justify-between min-w-[150px] bg-transparent"
                              >
                                {item.categoria || "Selecione categoria"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar categoria..."
                                  value={categoriaPesquisa}
                                  onValueChange={setCategoriaPesquisa}
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                                  <CommandGroup className="max-h-[200px] overflow-auto">
                                    {categorias
                                      .filter((categoria) =>
                                        categoria.Nome.toLowerCase().includes(categoriaPesquisa.toLowerCase()),
                                      )
                                      .map((categoria) => (
                                        <CommandItem
                                          key={categoria.ID}
                                          value={categoria.Nome}
                                          onSelect={() => {
                                            atualizarItem(item.id, "categoria", categoria.Nome)
                                            setCategoriaAberta(null)
                                            setCategoriaPesquisa("")
                                          }}
                                        >
                                          {categoria.Nome}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Popover
                            open={unidadeAberta === item.id}
                            onOpenChange={(open) => {
                              setUnidadeAberta(open ? item.id : null)
                              if (!open) setUnidadePesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={unidadeAberta === item.id}
                                className="w-full justify-between min-w-[120px] bg-transparent"
                              >
                                {item.unidadeDeMedida || "Selecione"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar unidade..."
                                  value={unidadePesquisa}
                                  onValueChange={setUnidadePesquisa}
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
                                  <CommandGroup className="max-h-[200px] overflow-auto">
                                    {unidadesMedida
                                      .filter((unidade) =>
                                        unidade.toLowerCase().includes(unidadePesquisa.toLowerCase()),
                                      )
                                      .map((unidade) => (
                                        <CommandItem
                                          key={unidade}
                                          value={unidade}
                                          onSelect={() => {
                                            atualizarItem(item.id, "unidadeDeMedida", unidade)
                                            setUnidadeAberta(null)
                                            setUnidadePesquisa("")
                                          }}
                                        >
                                          {unidade}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(item.id, "quantidade", Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <InputMonetario
                            value={item.valorUnitario}
                            onChange={(valor) => atualizarItem(item.id, "valorUnitario", valor)}
                            className="min-w-[140px]"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {item.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerItem(item.id)}
                            disabled={itens.length === 1}
                            className={cn(
                              "text-destructive hover:text-destructive",
                              itens.length === 1 && "opacity-50",
                            )}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={adicionarItem}
                type="button"
                className="w-full sm:w-auto bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>

              <div className="w-full sm:w-1/3 space-y-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {calcularTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Material a ser entregue na obra B."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" asChild className="w-full sm:w-auto bg-transparent">
            <Link href="/dashboard/orcamentos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isPending || !etapaSelecionada} className="w-full sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Orçamento"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
