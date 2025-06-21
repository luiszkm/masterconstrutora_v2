"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Package,
  BarChart2,
  AlertCircle,
  Building,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

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
  fornecedor: string // Adicionado campo de fornecedor principal
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

// Dados de exemplo
const orcamentosIniciais: Orcamento[] = [
  {
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
  },
  {
    id: 2,
    numero: "ORC-2023-102",
    cliente: "Carla Oliveira",
    projeto: "Residência Beira-Mar",
    valor: "R$ 1.800.000,00",
    data: "22/02/2023",
    status: "Pendente",
    fornecedor: "Mármores & Granitos SA", // Fornecedor principal
    materiais: [
      {
        id: 4,
        nome: "Mármores",
        quantidade: 80,
        unidade: "m²",
        valorUnitario: 950,
        valorTotal: 76000,
        fornecedor: "Mármores & Granitos SA",
      },
      {
        id: 5,
        nome: "Porcelanatos",
        quantidade: 200,
        unidade: "m²",
        valorUnitario: 89.9,
        valorTotal: 17980,
        fornecedor: "Mármores & Granitos SA",
      },
    ],
  },
  {
    id: 3,
    numero: "ORC-2023-103",
    cliente: "Fernando Almeida",
    projeto: "Cobertura Duplex",
    valor: "R$ 950.000,00",
    data: "15/03/2023",
    status: "Aprovado",
    fornecedor: "Elétrica Total", // Fornecedor principal
    materiais: [
      {
        id: 6,
        nome: "Cabos",
        quantidade: 1000,
        unidade: "m",
        valorUnitario: 5.8,
        valorTotal: 5800,
        fornecedor: "Elétrica Total",
      },
      {
        id: 7,
        nome: "Disjuntores",
        quantidade: 30,
        unidade: "un",
        valorUnitario: 45.9,
        valorTotal: 1377,
        fornecedor: "Elétrica Total",
      },
    ],
  },
  {
    id: 4,
    numero: "ORC-2023-104",
    cliente: "Juliana Martins",
    projeto: "Refúgio na Serra",
    valor: "R$ 1.200.000,00",
    data: "05/04/2023",
    status: "Em análise",
    fornecedor: "Madeiras Nobres", // Fornecedor principal
    materiais: [
      {
        id: 8,
        nome: "Madeira Maciça",
        quantidade: 50,
        unidade: "m³",
        valorUnitario: 2800,
        valorTotal: 140000,
        fornecedor: "Madeiras Nobres",
      },
      {
        id: 9,
        nome: "Deck",
        quantidade: 120,
        unidade: "m²",
        valorUnitario: 350,
        valorTotal: 42000,
        fornecedor: "Madeiras Nobres",
      },
    ],
  },
  {
    id: 5,
    numero: "ORC-2023-105",
    cliente: "Ricardo Souza",
    projeto: "Mansão Neoclássica",
    valor: "R$ 3.100.000,00",
    data: "18/05/2023",
    status: "Recusado",
    fornecedor: "Materiais Premium Ltda", // Fornecedor principal
    materiais: [
      {
        id: 10,
        nome: "Cimento",
        quantidade: 800,
        unidade: "Saco 50kg",
        valorUnitario: 31.8,
        valorTotal: 25440,
        fornecedor: "Materiais Premium Ltda",
      },
      {
        id: 11,
        nome: "Granitos",
        quantidade: 150,
        unidade: "m²",
        valorUnitario: 850,
        valorTotal: 127500,
        fornecedor: "Mármores & Granitos SA",
      },
    ],
  },
]

// Tipo para ordenação
type SortConfig = {
  key: string
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  [key: string]: string | string[]
}

export default function OrcamentosPage() {
  // Estado para orçamentos
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(orcamentosIniciais)

  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })

  // Estado para filtros
  const [filters, setFilters] = useState<Filters>({})

  // Estado para orçamentos filtrados
  const [filteredOrcamentos, setFilteredOrcamentos] = useState(orcamentos)

  // Estado para pesquisa de material
  const [searchMaterial, setSearchMaterial] = useState("")

  // Estado para o orçamento selecionado para adicionar material
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null)

  // Estado para o diálogo de adicionar material
  const [dialogOpen, setDialogOpen] = useState(false)

  // Estado para o novo material
  const [novoMaterial, setNovoMaterial] = useState("")
  const [novoFornecedor, setNovoFornecedor] = useState("")
  const [novaQuantidade, setNovaQuantidade] = useState<number>(0)
  const [novoValorUnitario, setNovoValorUnitario] = useState<number>(0)
  const [novaUnidade, setNovaUnidade] = useState("")

  // Estado para erro de material duplicado
  const [materialDuplicado, setMaterialDuplicado] = useState(false)

  // Função para ordenar
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    // Aplicar ordenação
    const sortedData = [...filteredOrcamentos].sort((a, b) => {
      // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1
      }
      // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredOrcamentos(sortedData)
  }

  // Função para aplicar filtros
  const applyFilters = () => {
    let result = orcamentos

    // Aplicar pesquisa de material
    if (searchMaterial) {
      result = result.filter((orcamento) =>
        orcamento.materiais.some((material) => material.nome.toLowerCase().includes(searchMaterial.toLowerCase())),
      )
    }

    // Aplicar filtros específicos
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key]
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        // Para filtros de array (como materiais)
        if (key === "materiais") {
          result = result.filter((orcamento) =>
            orcamento.materiais.some((material) => filterValue.includes(material.nome)),
          )
        } else if (key === "fornecedores") {
          result = result.filter((orcamento) =>
            orcamento.materiais.some((material) => filterValue.includes(material.fornecedor)),
          )
        }
      } else if (filterValue && typeof filterValue === "string" && filterValue !== "") {
        // Para filtros de string
        result = result.filter((orcamento) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = orcamento[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    })

    setFilteredOrcamentos(result)
  }

  // Aplicar filtros quando mudam
  useState(() => {
    applyFilters()
  }, [filters, searchMaterial])

  // Obter todos os tipos de materiais únicos
  const allMateriais = Array.from(new Set(orcamentos.flatMap((o) => o.materiais.map((m) => m.nome)))).sort()

  // Obter todos os fornecedores únicos
  const allFornecedores = Array.from(new Set(orcamentos.flatMap((o) => o.materiais.map((m) => m.fornecedor)))).sort()

  // Função para abrir o diálogo de adicionar material
  const abrirDialogoAdicionarMaterial = (orcamento: Orcamento) => {
    setOrcamentoSelecionado(orcamento)
    setNovoMaterial("")
    setNovoFornecedor("")
    setNovaQuantidade(0)
    setNovoValorUnitario(0)
    setNovaUnidade("")
    setMaterialDuplicado(false)
    setDialogOpen(true)
  }

  // Função para adicionar material ao orçamento
  const adicionarMaterial = () => {
    if (
      !orcamentoSelecionado ||
      !novoMaterial ||
      !novoFornecedor ||
      novaQuantidade <= 0 ||
      novoValorUnitario <= 0 ||
      !novaUnidade
    )
      return

    // Verificar se o material já existe para este orçamento
    const materialExistente = orcamentoSelecionado.materiais.some(
      (m) =>
        m.nome.toLowerCase() === novoMaterial.toLowerCase() &&
        m.fornecedor.toLowerCase() === novoFornecedor.toLowerCase(),
    )

    if (materialExistente) {
      setMaterialDuplicado(true)
      return
    }

    // Calcular valor total
    const valorTotal = novaQuantidade * novoValorUnitario

    // Criar novo material
    const novoMaterialObj: MaterialOrcamento = {
      id: Math.max(...orcamentoSelecionado.materiais.map((m) => m.id), 0) + 1,
      nome: novoMaterial,
      quantidade: novaQuantidade,
      unidade: novaUnidade,
      valorUnitario: novoValorUnitario,
      valorTotal: valorTotal,
      fornecedor: novoFornecedor,
    }

    // Atualizar orçamentos
    const orcamentosAtualizados = orcamentos.map((o) => {
      if (o.id === orcamentoSelecionado.id) {
        return {
          ...o,
          materiais: [...o.materiais, novoMaterialObj],
        }
      }
      return o
    })

    // Atualizar estado
    setOrcamentos(orcamentosAtualizados)
    setFilteredOrcamentos(
      filteredOrcamentos.map((o) => {
        if (o.id === orcamentoSelecionado.id) {
          return {
            ...o,
            materiais: [...o.materiais, novoMaterialObj],
          }
        }
        return o
      }),
    )

    // Fechar diálogo
    setDialogOpen(false)

    // Mostrar toast de sucesso
    toast({
      title: "Material adicionado com sucesso",
      description: `${novoMaterial} foi adicionado ao orçamento ${orcamentoSelecionado.numero}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (key: string, label: string) => (
    <TableHead>
      <button className="flex items-center gap-1 hover:text-primary" onClick={() => requestSort(key)}>
        {label}
        {sortConfig.key === key ? (
          sortConfig.direction === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <div className="w-4" />
        )}
      </button>
    </TableHead>
  )

  // Obter sugestões de materiais para a pesquisa
  const materialSuggestions = tiposMateriais
    .filter((material) => material.toLowerCase().includes(searchMaterial.toLowerCase()))
    .slice(0, 5)

  // Unidades de medida disponíveis
  const unidadesMedida = ["Saco 50kg", "m³", "m²", "m", "kg", "un", "L", "Barra", "Rolo", "Pacote", "Caixa"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col items-start md:flex-row md:items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
        <Button asChild>
          <Link href="/dashboard/orcamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Popover open={searchMaterial.length > 0 && materialSuggestions.length > 0}>
            <PopoverTrigger asChild>
              <Input
                type="search"
                placeholder="Buscar orçamentos por material..."
                className="w-full pl-8"
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
              />
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {materialSuggestions.map((material) => (
                      <CommandItem
                        key={material}
                        onSelect={() => {
                          setSearchMaterial(material)
                        }}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {material}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrar por</h4>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Status</h5>
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {["Aprovado", "Pendente", "Em análise", "Recusado"].map((status) => (
                        <CommandItem key={status}>
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status === status}
                            onCheckedChange={(checked) => {
                              setFilters({
                                ...filters,
                                status: checked ? status : "",
                              })
                            }}
                          />
                          <label htmlFor={`status-${status}`} className="ml-2 text-sm">
                            {status}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Materiais</h5>
                <Command>
                  <CommandInput placeholder="Buscar material..." />
                  <CommandList className="max-h-40 overflow-auto">
                    <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                    <CommandGroup>
                      {allMateriais.map((material) => (
                        <CommandItem key={material}>
                          <Checkbox
                            id={`material-${material}`}
                            checked={
                              filters.materiais &&
                              Array.isArray(filters.materiais) &&
                              filters.materiais.includes(material)
                            }
                            onCheckedChange={(checked) => {
                              const currentMateriais = Array.isArray(filters.materiais) ? [...filters.materiais] : []
                              setFilters({
                                ...filters,
                                materiais: checked
                                  ? [...currentMateriais, material]
                                  : currentMateriais.filter((m) => m !== material),
                              })
                            }}
                          />
                          <label htmlFor={`material-${material}`} className="ml-2 text-sm">
                            {material}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Fornecedores</h5>
                <Command>
                  <CommandInput placeholder="Buscar fornecedor..." />
                  <CommandList className="max-h-40 overflow-auto">
                    <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                    <CommandGroup>
                      {allFornecedores.map((fornecedor) => (
                        <CommandItem key={fornecedor}>
                          <Checkbox
                            id={`fornecedor-${fornecedor}`}
                            checked={
                              filters.fornecedores &&
                              Array.isArray(filters.fornecedores) &&
                              filters.fornecedores.includes(fornecedor)
                            }
                            onCheckedChange={(checked) => {
                              const currentFornecedores = Array.isArray(filters.fornecedores)
                                ? [...filters.fornecedores]
                                : []
                              setFilters({
                                ...filters,
                                fornecedores: checked
                                  ? [...currentFornecedores, fornecedor]
                                  : currentFornecedores.filter((f) => f !== fornecedor),
                              })
                            }}
                          />
                          <label htmlFor={`fornecedor-${fornecedor}`} className="ml-2 text-sm">
                            {fornecedor}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({})
                    setSearchMaterial("")
                    setFilteredOrcamentos(orcamentos)
                  }}
                >
                  Limpar Filtros
                </Button>
                <Button size="sm" onClick={() => applyFilters()}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" asChild>
          <Link href="/dashboard/orcamentos/comparar">
            <BarChart2 className="mr-2 h-4 w-4" />
            Comparar
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortableHeader("numero", "Número")}
              {renderSortableHeader("cliente", "Cliente")}
              {renderSortableHeader("projeto", "Projeto")}
              {renderSortableHeader("valor", "Valor")}
              {renderSortableHeader("data", "Data")}
              {renderSortableHeader("fornecedor", "Fornecedor")}
              <TableHead>Materiais</TableHead>
              {renderSortableHeader("status", "Status")}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrcamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum orçamento encontrado com o material especificado.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrcamentos.map((orcamento) => (
                <TableRow key={orcamento.id}>
                  <TableCell className="font-medium">{orcamento.numero}</TableCell>
                  <TableCell>{orcamento.cliente}</TableCell>
                  <TableCell>{orcamento.projeto}</TableCell>
                  <TableCell>{orcamento.valor}</TableCell>
                  <TableCell>{orcamento.data}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {orcamento.fornecedor}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Package className="mr-2 h-4 w-4" />
                          {orcamento.materiais.length} tipos
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Materiais do Orçamento</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirDialogoAdicionarMaterial(orcamento)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Adicionar
                            </Button>
                          </div>
                          <div className="max-h-60 overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Material</TableHead>
                                  <TableHead>Qtd</TableHead>
                                  <TableHead>Valor</TableHead>
                                  <TableHead>Fornecedor</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orcamento.materiais.map((material) => (
                                  <TableRow key={material.id}>
                                    <TableCell className="py-1">{material.nome}</TableCell>
                                    <TableCell className="py-1">
                                      {material.quantidade} {material.unidade}
                                    </TableCell>
                                    <TableCell className="py-1">
                                      R$ {material.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="py-1">{material.fornecedor}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        orcamento.status === "Aprovado"
                          ? "default"
                          : orcamento.status === "Pendente"
                            ? "outline"
                            : orcamento.status === "Em análise"
                              ? "secondary"
                              : "destructive"
                      }
                    >
                      {orcamento.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para adicionar material */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Material ao Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {materialDuplicado && (
              <div className="rounded-md bg-destructive/15 p-3 text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Este material já está associado a este orçamento com o mesmo fornecedor.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select value={novoMaterial} onValueChange={setNovoMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um material" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMateriais.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Select value={novoFornecedor} onValueChange={setNovoFornecedor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="0"
                  step="1"
                  value={novaQuantidade || ""}
                  onChange={(e) => setNovaQuantidade(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Select value={novaUnidade} onValueChange={setNovaUnidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                <Input
                  id="valorUnitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={novoValorUnitario || ""}
                  onChange={(e) => setNovoValorUnitario(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor Total</Label>
              <div className="rounded-md border px-3 py-2 text-right font-medium">
                R$ {(novaQuantidade * novoValorUnitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={adicionarMaterial}
              disabled={
                !novoMaterial || !novoFornecedor || novaQuantidade <= 0 || novoValorUnitario <= 0 || !novaUnidade
              }
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
