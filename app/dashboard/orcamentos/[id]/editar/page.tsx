"use client"

import { useState, useEffect, useActionState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Loader2, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/app/lib/utils"
import { getOrcamentoById, updateOrcamento, type ItemOrcamento, type Orcamento } from "@/app/actions/orcamento"

// Dados estáticos expandidos
const tiposMateriais = [
  "Cimento",
  "Areia",
  "Brita",
  "Aço",
  "Tintas",
  "Mármores",
  "Granitos",
  "Porcelanatos",
  "Cabos",
  "Disjuntores",
  "Quadros Elétricos",
  "Tubos PVC",
  "Conexões",
  "Registros",
  "Caixas d'água",
  "Madeira Maciça",
  "Compensados",
  "MDF",
  "Portas",
  "Deck",
  "Telhas",
  "Vidros",
  "Ferragens",
  "Impermeabilizantes",
  "Argamassas",
  "Gesso",
  "Drywall",
  "Isolantes",
  "Pisos Laminados",
  "Pisos Vinílicos",
]

const fornecedores = [
  "Materiais Premium Ltda",
  "Mármores & Granitos SA",
  "Elétrica Total",
  "Hidráulica Express",
  "Madeiras Nobres",
  "Construção & Cia",
  "Ferro & Aço Ltda",
  "Tintas & Vernizes SA",
]

const unidadesMedida = [
  "Saco 50kg",
  "m³",
  "m²",
  "m",
  "kg",
  "un",
  "L",
  "Barra",
  "Rolo",
  "Pacote",
  "Caixa",
  "Peça",
  "Conjunto",
]

const obras = ["Obra A", "Obra B", "Obra C", "Obra D", "Sem obra"]
const etapas = ["Fundação", "Estrutura", "Alvenaria", "Cobertura", "Acabamento", "Sem etapa"]

interface EditarOrcamentoPageProps {
  params: { id: string }
}

export default function EditarOrcamentoPage({ params }: EditarOrcamentoPageProps) {
  const router = useRouter()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action para atualizar orçamento
  const updateOrcamentoWithId = updateOrcamento.bind(null, params.id)
  const [state, formAction, isPending] = useActionState(updateOrcamentoWithId, null)

  // Estados para formulário
  const [vinculoObra, setVinculoObra] = useState("")
  const [etapaObra, setEtapaObra] = useState("")
  const [fornecedorPrincipal, setFornecedorPrincipal] = useState("")
  const [condicoesPagamento, setCondicoesPagamento] = useState("")
  const [dataEmissao, setDataEmissao] = useState("")
  const [observacoes, setObservacoes] = useState("")

  // Estados para itens
  const [itens, setItens] = useState<ItemOrcamento[]>([])

  // Estados para popovers
  const [materialAberto, setMaterialAberto] = useState<string | null>(null)
  const [materialPesquisa, setMaterialPesquisa] = useState("")
  const [fornecedorAberto, setFornecedorAberto] = useState<string | null>(null)
  const [fornecedorPesquisa, setFornecedorPesquisa] = useState("")
  const [unidadeAberta, setUnidadeAberta] = useState<string | null>(null)
  const [unidadePesquisa, setUnidadePesquisa] = useState("")

  // Carregar dados do orçamento
  useEffect(() => {
    async function loadOrcamento() {
      try {
        setLoading(true)
        const result = await getOrcamentoById(params.id)

        if ("error" in result) {
          setError(result.error)
        } else {
          const orcamentoData = result as Orcamento
          setOrcamento(orcamentoData)

          // Preencher estados do formulário
          setVinculoObra(orcamentoData.vinculoObra)
          setEtapaObra(orcamentoData.etapaObra)
          setFornecedorPrincipal(orcamentoData.fornecedorPrincipal)
          setCondicoesPagamento(orcamentoData.condicoesPagamento)
          setDataEmissao(orcamentoData.dataEmissao)
          setObservacoes(orcamentoData.observacoes || "")
          setItens(orcamentoData.itens)
        }
      } catch (err) {
        setError("Erro ao carregar orçamento")
      } finally {
        setLoading(false)
      }
    }

    loadOrcamento()
  }, [params.id])

  // Função para adicionar um novo item
  const adicionarItem = () => {
    const novoItem: ItemOrcamento = {
      id: Date.now().toString(),
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      fornecedor: "",
      unidade: "",
    }
    setItens([...itens, novoItem])
  }

  // Função para remover um item
  const removerItem = (id: string) => {
    if (itens.length === 1) {
      toast({
        title: "Ação não permitida",
        description: "O orçamento deve ter pelo menos um item.",
        variant: "destructive",
      })
      return
    }
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
  const calcularImpostos = () => calcularSubtotal() * 0.1
  const calcularTotal = () => calcularSubtotal() + calcularImpostos()

  // Função para submeter o formulário
  const handleSubmit = async (formData: FormData) => {
    // Validações básicas
    if (!vinculoObra || !etapaObra || !fornecedorPrincipal || !condicoesPagamento) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (itens.length === 0) {
      toast({
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um item ao orçamento.",
        variant: "destructive",
      })
      return
    }

    // Verificar se todos os itens estão preenchidos
    const itensIncompletos = itens.filter(
      (item) => !item.descricao || !item.fornecedor || !item.unidade || item.quantidade <= 0 || item.valorUnitario <= 0,
    )

    if (itensIncompletos.length > 0) {
      toast({
        title: "Itens incompletos",
        description: "Preencha todos os campos dos itens do orçamento.",
        variant: "destructive",
      })
      return
    }

    // Adicionar itens como JSON ao FormData
    formData.append("itens", JSON.stringify(itens))

    // Chamar a action
    const result = await formAction(formData)

    if (result?.success) {
      toast({
        title: "Orçamento atualizado",
        description: result.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
      router.push("/dashboard/orcamentos")
    } else if (result?.message) {
      toast({
        title: "Erro ao atualizar",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  // Função para obter cor do status
  const getStatusColor = (status: Orcamento["status"]) => {
    switch (status) {
      case "Rascunho":
        return "bg-gray-500"
      case "Enviado":
        return "bg-blue-500"
      case "Aprovado":
        return "bg-green-500"
      case "Rejeitado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orcamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Carregando orçamento...</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !orcamento) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orcamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Orçamento não encontrado</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar orçamento</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/dashboard/orcamentos">Voltar para lista</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orcamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Editar Orçamento</h2>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {orcamento.id} • Criado em {new Date(orcamento.createdAt!).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(orcamento.status)}>{orcamento.status}</Badge>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Detalhes do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Detalhes do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vinculoObra" className="text-sm font-medium">
                  Vínculo de obra <span className="text-red-500">*</span>
                </Label>
                <Select name="vinculoObra" value={vinculoObra} onValueChange={setVinculoObra} required>
                  <SelectTrigger id="vinculoObra" className="w-full">
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {obras.map((obra) => (
                      <SelectItem key={obra} value={obra}>
                        {obra}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="etapaObra" className="text-sm font-medium">
                  Etapa da obra <span className="text-red-500">*</span>
                </Label>
                <Select name="etapaObra" value={etapaObra} onValueChange={setEtapaObra} required>
                  <SelectTrigger id="etapaObra" className="w-full">
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {etapas.map((etapa) => (
                      <SelectItem key={etapa} value={etapa}>
                        {etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataEmissao" className="text-sm font-medium">
                  Data de Emissão <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataEmissao"
                  name="dataEmissao"
                  type="date"
                  value={dataEmissao}
                  onChange={(e) => setDataEmissao(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedorPrincipal" className="text-sm font-medium">
                  Fornecedor Principal <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="fornecedorPrincipal"
                  value={fornecedorPrincipal}
                  onValueChange={setFornecedorPrincipal}
                  required
                >
                  <SelectTrigger id="fornecedorPrincipal" className="w-full">
                    <SelectValue placeholder="Selecione o fornecedor principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((fornecedor) => (
                      <SelectItem key={fornecedor} value={fornecedor}>
                        {fornecedor}
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
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Itens do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tabela responsiva */}
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="min-w-[150px] font-semibold">Material</TableHead>
                      <TableHead className="min-w-[150px] font-semibold">Fornecedor</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Unidade</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Qtd.</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Valor Unit.</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Valor Total</TableHead>
                      <TableHead className="w-[80px] font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}>
                        <TableCell>
                          <Popover
                            open={materialAberto === item.id}
                            onOpenChange={(open) => {
                              setMaterialAberto(open ? item.id : null)
                              if (!open) setMaterialPesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={materialAberto === item.id}
                                className="w-full justify-between h-9 text-left"
                              >
                                <span className="truncate">{item.descricao || "Selecione um material"}</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar material..."
                                  value={materialPesquisa}
                                  onValueChange={setMaterialPesquisa}
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                                  <CommandGroup className="max-h-[200px] overflow-auto">
                                    {tiposMateriais
                                      .filter((material) =>
                                        material.toLowerCase().includes(materialPesquisa.toLowerCase()),
                                      )
                                      .map((material) => (
                                        <CommandItem
                                          key={material}
                                          value={material}
                                          onSelect={() => {
                                            atualizarItem(item.id, "descricao", material)
                                            setMaterialAberto(null)
                                            setMaterialPesquisa("")
                                          }}
                                        >
                                          {material}
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
                            open={fornecedorAberto === item.id}
                            onOpenChange={(open) => {
                              setFornecedorAberto(open ? item.id : null)
                              if (!open) setFornecedorPesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={fornecedorAberto === item.id}
                                className="w-full justify-between h-9 text-left"
                              >
                                <span className="truncate">{item.fornecedor || "Selecione um fornecedor"}</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar fornecedor..."
                                  value={fornecedorPesquisa}
                                  onValueChange={setFornecedorPesquisa}
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                                  <CommandGroup className="max-h-[200px] overflow-auto">
                                    {fornecedores
                                      .filter((fornecedor) =>
                                        fornecedor.toLowerCase().includes(fornecedorPesquisa.toLowerCase()),
                                      )
                                      .map((fornecedor) => (
                                        <CommandItem
                                          key={fornecedor}
                                          value={fornecedor}
                                          onSelect={() => {
                                            atualizarItem(item.id, "fornecedor", fornecedor)
                                            setFornecedorAberto(null)
                                            setFornecedorPesquisa("")
                                          }}
                                        >
                                          {fornecedor}
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
                                className="w-full justify-between h-9 text-left"
                              >
                                <span className="truncate">{item.unidade || "Selecione"}</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
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
                                            atualizarItem(item.id, "unidade", unidade)
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
                            className="w-20 h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) => atualizarItem(item.id, "valorUnitario", Number(e.target.value))}
                            className="w-24 h-9"
                            placeholder="0,00"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="text-right">
                            R$ {item.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerItem(item.id)}
                            className={cn(
                              "text-destructive hover:text-destructive h-8 w-8",
                              itens.length === 1 && "opacity-50 cursor-not-allowed",
                            )}
                            type="button"
                            disabled={itens.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover item</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Controles e resumo */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
              <Button variant="outline" size="sm" onClick={adicionarItem} type="button" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>

              <Card className="w-full lg:w-auto lg:min-w-[300px]">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {calcularSubtotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Impostos (10%):</span>
                      <span>R$ {calcularImpostos().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">
                        R$ {calcularTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Condições e Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              Condições e Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condicoesPagamento" className="text-sm font-medium">
                Condições de Pagamento <span className="text-red-500">*</span>
              </Label>
              <Select
                name="condicoesPagamento"
                value={condicoesPagamento}
                onValueChange={setCondicoesPagamento}
                required
              >
                <SelectTrigger id="condicoesPagamento" className="w-full">
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avista">À Vista</SelectItem>
                  <SelectItem value="30dias">30 dias</SelectItem>
                  <SelectItem value="60dias">60 dias</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-medium">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Observações adicionais sobre o orçamento..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/orcamentos">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Link>
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de erro/sucesso */}
        {state?.message && (
          <Card className={state.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="pt-6">
              <div className={`text-center ${state.success ? "text-green-700" : "text-red-700"}`}>{state.message}</div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
