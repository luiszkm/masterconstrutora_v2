"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { cn } from "@/app/lib/utils"
import { createOrcamento, type ItemOrcamento } from "@/app/actions/orcamento"

// Dados estáticos (em produção, viriam do backend)
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
]

const unidadesMedida = ["Saco 50kg", "m³", "m²", "m", "kg", "un", "L", "Barra", "Rolo", "Pacote", "Caixa"]

const obras = ["Obra A", "Obra B", "Obra C", "Sem obra"]
const etapas = ["Fundação", "Estrutura", "Alvenaria", "Acabamento", "Sem etapa"]

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createOrcamento, null)

  // Estados para formulário
  const [vinculoObra, setVinculoObra] = useState("")
  const [etapaObra, setEtapaObra] = useState("")
  const [fornecedorPrincipal, setFornecedorPrincipal] = useState("")
  const [condicoesPagamento, setCondicoesPagamento] = useState("")

  // Estados para itens
  const [itens, setItens] = useState<ItemOrcamento[]>([
    {
      id: "1",
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      fornecedor: "",
      unidade: "",
    },
  ])

  // Estados para popovers
  const [materialAberto, setMaterialAberto] = useState<string | null>(null)
  const [materialPesquisa, setMaterialPesquisa] = useState("")
  const [fornecedorAberto, setFornecedorAberto] = useState<string | null>(null)
  const [fornecedorPesquisa, setFornecedorPesquisa] = useState("")
  const [unidadeAberta, setUnidadeAberta] = useState<string | null>(null)
  const [unidadePesquisa, setUnidadePesquisa] = useState("")

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
    // Adicionar itens como JSON ao FormData
    formData.append("itens", JSON.stringify(itens))

    // Chamar a action
    const result = await formAction(formData)

    if (result?.success) {
      toast({
        title: "Orçamento criado",
        description: result.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
      router.push("/dashboard/orcamentos")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Novo Orçamento</h2>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Detalhes do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vinculoObra">Vínculo de obra</Label>
                <Select name="vinculoObra" value={vinculoObra} onValueChange={setVinculoObra} required>
                  <SelectTrigger id="vinculoObra">
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
                <Label htmlFor="etapaObra">Etapa da obra</Label>
                <Select name="etapaObra" value={etapaObra} onValueChange={setEtapaObra} required>
                  <SelectTrigger id="etapaObra">
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
                <Label htmlFor="dataEmissao">Data de Emissão</Label>
                <Input
                  id="dataEmissao"
                  name="dataEmissao"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedorPrincipal">Fornecedor Principal</Label>
                <Select
                  name="fornecedorPrincipal"
                  value={fornecedorPrincipal}
                  onValueChange={setFornecedorPrincipal}
                  required
                >
                  <SelectTrigger id="fornecedorPrincipal">
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
            <CardTitle>Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Material</TableHead>
                      <TableHead className="min-w-[150px]">Fornecedor</TableHead>
                      <TableHead className="min-w-[100px]">Unidade</TableHead>
                      <TableHead className="min-w-[100px]">Quantidade</TableHead>
                      <TableHead className="min-w-[120px]">Valor Unitário</TableHead>
                      <TableHead className="min-w-[120px]">Valor Total</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item) => (
                      <TableRow key={item.id}>
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
                                className="w-full justify-between"
                              >
                                {item.descricao || "Selecione um material"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
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
                                className="w-full justify-between"
                              >
                                {item.fornecedor || "Selecione um fornecedor"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
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
                                className="w-full justify-between"
                              >
                                {item.unidade || "Selecione"}
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
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) => atualizarItem(item.id, "valorUnitario", Number(e.target.value))}
                            className="w-24"
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
              <Button variant="outline" size="sm" onClick={adicionarItem} type="button" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>

              <div className="w-full sm:w-1/3 space-y-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {calcularSubtotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos (10%):</span>
                  <span>R$ {calcularImpostos().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {calcularTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condições e Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Condições e Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condicoesPagamento">Condições de Pagamento</Label>
              <Select
                name="condicoesPagamento"
                value={condicoesPagamento}
                onValueChange={setCondicoesPagamento}
                required
              >
                <SelectTrigger id="condicoesPagamento">
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avista">À Vista</SelectItem>
                  <SelectItem value="30dias">30 dias</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" placeholder="Observações adicionais sobre o orçamento" />
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/orcamentos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Salvando..." : "Salvar Orçamento"}
          </Button>
        </div>

        {/* Mensagem de erro/sucesso */}
        {state?.message && (
          <div className={`mt-4 text-center ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</div>
        )}
      </form>
    </div>
  )
}
