"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
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
import { cn } from "@/lib/utils"

// Lista de todos os tipos de materiais disponíveis no sistema
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

// Lista de fornecedores disponíveis
const fornecedores = [
  "Materiais Premium Ltda",
  "Mármores & Granitos SA",
  "Elétrica Total",
  "Hidráulica Express",
  "Madeiras Nobres",
]

// Unidades de medida disponíveis
const unidadesMedida = ["Saco 50kg", "m³", "m²", "m", "kg", "un", "L", "Barra", "Rolo", "Pacote", "Caixa"]

// Tipo para item de orçamento
type ItemOrcamento = {
  id: number
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  fornecedor: string
  unidade: string
}

export default function NovoOrcamentoPage() {
  // Estado para o fornecedor principal
  const [fornecedorPrincipal, setFornecedorPrincipal] = useState("")

  // Estado para os itens do orçamento
  const [itens, setItens] = useState<ItemOrcamento[]>([
    {
      id: 1,
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      fornecedor: "",
      unidade: "",
    },
  ])

  // Estado para pesquisa de material
  const [materialAberto, setMaterialAberto] = useState<number | null>(null)
  const [materialPesquisa, setMaterialPesquisa] = useState("")

  // Estado para pesquisa de fornecedor
  const [fornecedorAberto, setFornecedorAberto] = useState<number | null>(null)
  const [fornecedorPesquisa, setFornecedorPesquisa] = useState("")

  // Estado para pesquisa de unidade
  const [unidadeAberta, setUnidadeAberta] = useState<number | null>(null)
  const [unidadePesquisa, setUnidadePesquisa] = useState("")

  // Função para adicionar um novo item
  const adicionarItem = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir comportamento padrão do botão

    const novoItem: ItemOrcamento = {
      id: itens.length > 0 ? Math.max(...itens.map((item) => item.id)) + 1 : 1,
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
  const removerItem = (id: number) => {
    setItens(itens.filter((item) => item.id !== id))
  }

  // Função para atualizar um item
  const atualizarItem = (id: number, campo: keyof ItemOrcamento, valor: any) => {
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

  // Função para calcular o subtotal
  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + item.valorTotal, 0)
  }

  // Função para calcular impostos (10%)
  const calcularImpostos = () => {
    return calcularSubtotal() * 0.1
  }

  // Função para calcular o total
  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpostos()
  }

  // Função para salvar o orçamento
  const salvarOrcamento = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir comportamento padrão do botão

    // Aqui você implementaria a lógica para salvar o orçamento no backend
    toast({
      title: "Orçamento salvo",
      description: "O orçamento foi salvo com sucesso.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Novo Orçamento</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8">
         

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                
                <div className="space-y-2">
                  <Label htmlFor="tipoProjeto">Vinculo de obra</Label>
                  <Select>
                    <SelectTrigger id="tipoProjeto">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construcao">Construção Nova</SelectItem>
                      <SelectItem value="reforma">Reforma</SelectItem>
                      <SelectItem value="interiores">Design de Interiores</SelectItem>
                      <SelectItem value="paisagismo">Paisagismo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                     <div className="space-y-2">
                  <Label htmlFor="tipoProjeto">Etapa da obra</Label>
                  <Select>
                    <SelectTrigger id="tipoProjeto">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construcao">Construção Nova</SelectItem>
                      <SelectItem value="reforma">Reforma</SelectItem>
                      <SelectItem value="interiores">Design de Interiores</SelectItem>
                      <SelectItem value="paisagismo">Paisagismo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Emissao</Label>
                  <Input id="dataInicio" type="date" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="fornecedorPrincipal">Fornecedor Principal</Label>
                <Select value={fornecedorPrincipal} onValueChange={setFornecedorPrincipal}>
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

          <Card>
            <CardHeader>
              <CardTitle>Itens do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
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
                                    .filter((unidade) => unidade.toLowerCase().includes(unidadePesquisa.toLowerCase()))
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
                          className={cn("text-destructive hover:text-destructive", itens.length === 1 && "opacity-50")}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" onClick={adicionarItem} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
              <div className="flex justify-end">
                <div className="w-1/3 space-y-2"> 
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>R$ {calcularTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condições e Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="condicoesPagamento">Condições de Pagamento</Label>
                <Select>
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
                <Textarea id="observacoes" placeholder="Observações adicionais sobre o orçamento" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/orcamentos">Cancelar</Link>
            </Button>
            <Button type="button" onClick={salvarOrcamento}>
              Salvar Orçamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
