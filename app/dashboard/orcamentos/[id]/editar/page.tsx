"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// Tipo para material em orçamento
type MaterialOrcamento = {
  id: number
  nome: string
  quantidade: number
  unidade: string
  valorUnitario: number
  valorTotal: number
  fornecedor: string
}

// Tipo para orçamento
type Orcamento = {
  id: number
  numero: string
  cliente: string
  projeto: string
  valor: string
  data: string
  status: string
  fornecedor: string // Fornecedor principal
  materiais: MaterialOrcamento[]
}

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

// Dados de exemplo para o orçamento
const orcamentoExemplo: Orcamento = {
  id: 1,
  numero: "ORC-2023-101",
  cliente: "Roberto Mendes",
  projeto: "Mansão Alphaville",
  valor: "R$ 2.500.000,00",
  data: "10/01/2023",
  status: "Aprovado",
  fornecedor: "Materiais Premium Ltda", // Fornecedor principal
  materiais: [
    {
      id: 1,
      nome: "Cimento",
      quantidade: 500,
      unidade: "Saco 50kg",
      valorUnitario: 32.5,
      valorTotal: 16250,
      fornecedor: "Materiais Premium Ltda",
    },
    {
      id: 2,
      nome: "Areia",
      quantidade: 120,
      unidade: "m³",
      valorUnitario: 120,
      valorTotal: 14400,
      fornecedor: "Materiais Premium Ltda",
    },
    {
      id: 3,
      nome: "Aço",
      quantidade: 2000,
      unidade: "kg",
      valorUnitario: 8.5,
      valorTotal: 17000,
      fornecedor: "Materiais Premium Ltda",
    },
  ],
}

export default function EditarOrcamentoPage({ params }: { params: { id: string } }) {
  // Estado para o orçamento
  const [orcamento, setOrcamento] = useState<Orcamento>(orcamentoExemplo)

  // Estado para pesquisa de material
  const [materialAberto, setMaterialAberto] = useState<number | null>(null)
  const [materialPesquisa, setMaterialPesquisa] = useState("")

  // Estado para pesquisa de fornecedor
  const [fornecedorAberto, setFornecedorAberto] = useState<number | null>(null)
  const [fornecedorPesquisa, setFornecedorPesquisa] = useState("")

  // Estado para pesquisa de unidade
  const [unidadeAberta, setUnidadeAberta] = useState<number | null>(null)
  const [unidadePesquisa, setUnidadePesquisa] = useState("")

  // Função para atualizar o orçamento
  const atualizarOrcamento = (campo: string, valor: string) => {
    setOrcamento({
      ...orcamento,
      [campo]: valor,
    })
  }

  // Função para adicionar material
  const adicionarMaterial = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir comportamento padrão do botão

    const novoMaterial: MaterialOrcamento = {
      id: Math.max(...orcamento.materiais.map((m) => m.id), 0) + 1,
      nome: "",
      quantidade: 1,
      unidade: "",
      valorUnitario: 0,
      valorTotal: 0,
      fornecedor: "",
    }

    setOrcamento({
      ...orcamento,
      materiais: [...orcamento.materiais, novoMaterial],
    })
  }

  // Função para remover material
  const removerMaterial = (id: number) => {
    setOrcamento({
      ...orcamento,
      materiais: orcamento.materiais.filter((m) => m.id !== id),
    })

    toast({
      title: "Material removido",
      description: "O material foi removido do orçamento com sucesso.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para atualizar material
  const atualizarMaterial = (id: number, campo: keyof MaterialOrcamento, valor: any) => {
    setOrcamento({
      ...orcamento,
      materiais: orcamento.materiais.map((material) => {
        if (material.id === id) {
          const materialAtualizado = { ...material, [campo]: valor }
          // Recalcular valor total se quantidade ou valor unitário mudar
          if (campo === "quantidade" || campo === "valorUnitario") {
            materialAtualizado.valorTotal = materialAtualizado.quantidade * materialAtualizado.valorUnitario
          }
          return materialAtualizado
        }
        return material
      }),
    })
  }

  // Função para salvar o orçamento
  const salvarOrcamento = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir comportamento padrão do botão

    // Aqui você implementaria a lógica para salvar o orçamento no backend
    toast({
      title: "Orçamento atualizado",
      description: "As alterações foram salvas com sucesso.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Calcular o valor total do orçamento
  const calcularTotal = () => {
    return orcamento.materiais.reduce((total, material) => total + material.valorTotal, 0)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Editar Orçamento</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={orcamento.numero}
                    disabled
                    onChange={(e) => atualizarOrcamento("numero", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data de Emissão</Label>
                  <Input
                    id="data"
                    value={orcamento.data}
                    onChange={(e) => atualizarOrcamento("data", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               
                <div className="space-y-2">
                  <Label htmlFor="projeto">Obra</Label>
                  <Input
                    id="projeto"
                    value={orcamento.projeto}
                    onChange={(e) => atualizarOrcamento("projeto", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={orcamento.status} onValueChange={(value) => atualizarOrcamento("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em análise">Em análise</SelectItem>
                      <SelectItem value="Recusado">Recusado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor Principal</Label>
                  <Select
                    value={orcamento.fornecedor}
                    onValueChange={(value) => atualizarOrcamento("fornecedor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
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
              <CardTitle>Materiais do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Valor Unitário</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamento.materiais.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <Popover
                            open={materialAberto === material.id}
                            onOpenChange={(open) => {
                              setMaterialAberto(open ? material.id : null)
                              if (!open) setMaterialPesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={materialAberto === material.id}
                                className="w-full justify-between"
                              >
                                {material.nome || "Selecione um material"}
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
                                      .map((nome) => (
                                        <CommandItem
                                          key={nome}
                                          value={nome}
                                          onSelect={() => {
                                            atualizarMaterial(material.id, "nome", nome)
                                            setMaterialAberto(null)
                                            setMaterialPesquisa("")
                                          }}
                                        >
                                          {nome}
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
                            open={fornecedorAberto === material.id}
                            onOpenChange={(open) => {
                              setFornecedorAberto(open ? material.id : null)
                              if (!open) setFornecedorPesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={fornecedorAberto === material.id}
                                className="w-full justify-between"
                              >
                                {material.fornecedor || "Selecione um fornecedor"}
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
                                            atualizarMaterial(material.id, "fornecedor", fornecedor)
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
                          <Input
                            type="number"
                            min="1"
                            value={material.quantidade}
                            onChange={(e) => atualizarMaterial(material.id, "quantidade", Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Popover
                            open={unidadeAberta === material.id}
                            onOpenChange={(open) => {
                              setUnidadeAberta(open ? material.id : null)
                              if (!open) setUnidadePesquisa("")
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={unidadeAberta === material.id}
                                className="w-full justify-between"
                              >
                                {material.unidade || "Selecione"}
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
                                            atualizarMaterial(material.id, "unidade", unidade)
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
                            min="0"
                            step="0.01"
                            value={material.valorUnitario}
                            onChange={(e) => atualizarMaterial(material.id, "valorUnitario", Number(e.target.value))}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {material.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerMaterial(material.id)}
                            className="text-destructive hover:text-destructive"
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
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={adicionarMaterial} type="button">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Material
                </Button>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold">
                    R$ {calcularTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/orcamentos">Cancelar</Link>
            </Button>
            <Button type="button" onClick={salvarOrcamento}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
