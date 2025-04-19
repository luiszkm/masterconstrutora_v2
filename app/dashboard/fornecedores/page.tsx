"use client"

import { useState, useRef } from "react"
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
  FileText,
  Star,
  StarHalf,
  ChevronUp,
  ChevronDown,
  Filter,
  Package,
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Tipos de materiais para cada fornecedor
type MaterialTipo = {
  id: number
  nome: string
}

// Tipo para fornecedor
type Fornecedor = {
  id: number
  nome: string
  categoria: string
  contato: string
  telefone: string
  status: string
  avaliacao: number
  orcamentos: number
  materiais: MaterialTipo[]
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

// Dados de exemplo
const fornecedoresIniciais: Fornecedor[] = [
  {
    id: 1,
    nome: "Materiais Premium Ltda",
    categoria: "Materiais de Construção",
    contato: "Carlos Rodrigues",
    telefone: "(11) 98765-4321",
    status: "Ativo",
    avaliacao: 5,
    orcamentos: 8,
    materiais: [
      { id: 1, nome: "Cimento" },
      { id: 2, nome: "Areia" },
      { id: 3, nome: "Brita" },
      { id: 4, nome: "Aço" },
      { id: 5, nome: "Tintas" },
    ],
  },
  {
    id: 2,
    nome: "Mármores & Granitos SA",
    categoria: "Acabamentos",
    contato: "Fernanda Lima",
    telefone: "(11) 91234-5678",
    status: "Ativo",
    avaliacao: 4.5,
    orcamentos: 5,
    materiais: [
      { id: 6, nome: "Mármores" },
      { id: 7, nome: "Granitos" },
      { id: 8, nome: "Porcelanatos" },
    ],
  },
  {
    id: 3,
    nome: "Elétrica Total",
    categoria: "Instalações Elétricas",
    contato: "Roberto Alves",
    telefone: "(11) 97777-8888",
    status: "Inativo",
    avaliacao: 3,
    orcamentos: 2,
    materiais: [
      { id: 9, nome: "Cabos" },
      { id: 10, nome: "Disjuntores" },
      { id: 11, nome: "Quadros Elétricos" },
    ],
  },
  {
    id: 4,
    nome: "Hidráulica Express",
    categoria: "Instalações Hidráulicas",
    contato: "Mariana Costa",
    telefone: "(11) 96666-7777",
    status: "Ativo",
    avaliacao: 4,
    orcamentos: 6,
    materiais: [
      { id: 12, nome: "Tubos PVC" },
      { id: 13, nome: "Conexões" },
      { id: 14, nome: "Registros" },
      { id: 15, nome: "Caixas d'água" },
    ],
  },
  {
    id: 5,
    nome: "Madeiras Nobres",
    categoria: "Madeiras",
    contato: "Paulo Mendes",
    telefone: "(11) 95555-6666",
    status: "Ativo",
    avaliacao: 5,
    orcamentos: 10,
    materiais: [
      { id: 16, nome: "Madeira Maciça" },
      { id: 17, nome: "Compensados" },
      { id: 18, nome: "MDF" },
      { id: 19, nome: "Portas" },
      { id: 20, nome: "Deck" },
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

export default function FornecedoresPage() {
  // Estado para fornecedores
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(fornecedoresIniciais)

  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })

  // Estado para filtros
  const [filters, setFilters] = useState<Filters>({})

  // Estado para fornecedores filtrados
  const [filteredFornecedores, setFilteredFornecedores] = useState(fornecedores)

  // Estado para pesquisa de material
  const [searchMaterial, setSearchMaterial] = useState("")

  // Estado para o fornecedor selecionado para adicionar material
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null)

  // Estado para o diálogo de adicionar material
  const [dialogOpen, setDialogOpen] = useState(false)

  // Estado para o novo material
  const [novoMaterial, setNovoMaterial] = useState("")

  // Estado para erro de material duplicado
  const [materialDuplicado, setMaterialDuplicado] = useState(false)

  // Referência para o último ID de material
  const ultimoIdMaterialRef = useRef(20) // Começando de 20 pois já temos 20 materiais nos dados iniciais

  // Função para renderizar as estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    // Adiciona estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)
    }

    // Adiciona meia estrela se necessário
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-500 text-yellow-500" />)
    }

    // Adiciona estrelas vazias
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-yellow-500" />)
    }

    return <div className="flex">{stars}</div>
  }

  // Função para ordenar
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    // Aplicar ordenação
    const sortedData = [...filteredFornecedores].sort((a, b) => {
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

    setFilteredFornecedores(sortedData)
  }

  // Função para aplicar filtros
  const applyFilters = () => {
    let result = fornecedores

    // Aplicar pesquisa de material
    if (searchMaterial) {
      result = result.filter((fornecedor) =>
        fornecedor.materiais.some((material) => material.nome.toLowerCase().includes(searchMaterial.toLowerCase())),
      )
    }

    // Aplicar filtros específicos
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key]
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        // Para filtros de array (como materiais)
        if (key === "materiais") {
          result = result.filter((fornecedor) =>
            fornecedor.materiais.some((material) => filterValue.includes(material.nome)),
          )
        }
      } else if (filterValue && typeof filterValue === "string" && filterValue !== "") {
        // Para filtros de string
        result = result.filter((fornecedor) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = fornecedor[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    })

    setFilteredFornecedores(result)
  }

  // Aplicar filtros quando mudam
  useState(() => {
    applyFilters()
  }, [filters, searchMaterial])

  // Obter todos os tipos de materiais únicos
  const allMateriais = Array.from(new Set(fornecedores.flatMap((f) => f.materiais.map((m) => m.nome)))).sort()

  // Função para abrir o diálogo de adicionar material
  const abrirDialogoAdicionarMaterial = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor)
    setNovoMaterial("")
    setMaterialDuplicado(false)
    setDialogOpen(true)
  }

  // Função para adicionar material ao fornecedor
  const adicionarMaterial = () => {
    if (!fornecedorSelecionado || !novoMaterial) return

    // Verificar se o material já existe para este fornecedor
    const materialExistente = fornecedorSelecionado.materiais.some(
      (m) => m.nome.toLowerCase() === novoMaterial.toLowerCase(),
    )

    if (materialExistente) {
      setMaterialDuplicado(true)
      return
    }

    // Incrementar o ID do material
    ultimoIdMaterialRef.current += 1

    // Criar novo material
    const novoMaterialObj: MaterialTipo = {
      id: ultimoIdMaterialRef.current,
      nome: novoMaterial,
    }

    // Atualizar fornecedores
    const fornecedoresAtualizados = fornecedores.map((f) => {
      if (f.id === fornecedorSelecionado.id) {
        return {
          ...f,
          materiais: [...f.materiais, novoMaterialObj],
        }
      }
      return f
    })

    // Atualizar estado
    setFornecedores(fornecedoresAtualizados)
    setFilteredFornecedores(
      filteredFornecedores.map((f) => {
        if (f.id === fornecedorSelecionado.id) {
          return {
            ...f,
            materiais: [...f.materiais, novoMaterialObj],
          }
        }
        return f
      }),
    )

    // Fechar diálogo
    setDialogOpen(false)

    // Mostrar toast de sucesso
    toast({
      title: "Material adicionado com sucesso",
      description: `${novoMaterial} foi adicionado à lista de materiais de ${fornecedorSelecionado.nome}.`,
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

  // Filtrar materiais disponíveis (que não estão já associados ao fornecedor)
  const materiaisDisponiveis = fornecedorSelecionado
    ? tiposMateriais.filter(
        (material) => !fornecedorSelecionado.materiais.some((m) => m.nome.toLowerCase() === material.toLowerCase()),
      )
    : []

  // Obter sugestões de materiais para a pesquisa
  const materialSuggestions = tiposMateriais
    .filter((material) => material.toLowerCase().includes(searchMaterial.toLowerCase()))
    .slice(0, 5)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
        <Button asChild>
          <Link href="/dashboard/fornecedores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
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
                placeholder="Buscar fornecedores por material..."
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
                <h5 className="text-sm font-medium">Categoria</h5>
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      {Array.from(new Set(fornecedores.map((f) => f.categoria))).map((categoria) => (
                        <CommandItem key={categoria}>
                          <Checkbox
                            id={`categoria-${categoria}`}
                            checked={filters.categoria === categoria}
                            onCheckedChange={(checked) => {
                              setFilters({
                                ...filters,
                                categoria: checked ? categoria : "",
                              })
                            }}
                          />
                          <label htmlFor={`categoria-${categoria}`} className="ml-2 text-sm">
                            {categoria}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Status</h5>
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {["Ativo", "Inativo"].map((status) => (
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

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({})
                    setSearchMaterial("")
                    setFilteredFornecedores(fornecedores)
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
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortableHeader("nome", "Nome")}
              {renderSortableHeader("categoria", "Categoria")}
              {renderSortableHeader("contato", "Contato")}
              {renderSortableHeader("telefone", "Telefone")}
              <TableHead>Materiais</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Orçamentos</TableHead>
              {renderSortableHeader("status", "Status")}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum fornecedor encontrado com o material especificado.
                </TableCell>
              </TableRow>
            ) : (
              filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                  <TableCell>{fornecedor.categoria}</TableCell>
                  <TableCell>{fornecedor.contato}</TableCell>
                  <TableCell>{fornecedor.telefone}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Package className="mr-2 h-4 w-4" />
                          {fornecedor.materiais.length} tipos
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Materiais Fornecidos</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirDialogoAdicionarMaterial(fornecedor)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Adicionar
                            </Button>
                          </div>
                          <ul className="max-h-40 overflow-auto space-y-1">
                            {fornecedor.materiais.map((material) => (
                              <li key={material.id} className="text-sm py-1 border-b last:border-0">
                                {material.nome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>{renderStars(fornecedor.avaliacao)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/fornecedores/${fornecedor.id}/orcamentos`}>
                        <FileText className="mr-2 h-4 w-4" />
                        {fornecedor.orcamentos}
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={fornecedor.status === "Ativo" ? "default" : "secondary"}>{fornecedor.status}</Badge>
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
                          <Link href={`/dashboard/fornecedores/${fornecedor.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {materialDuplicado && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>Este material já está associado a este fornecedor.</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Select value={novoMaterial} onValueChange={setNovoMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um material" />
                </SelectTrigger>
                <SelectContent>
                  {materiaisDisponiveis.length === 0 ? (
                    <SelectItem value="" disabled>
                      Não há materiais disponíveis
                    </SelectItem>
                  ) : (
                    materiaisDisponiveis.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionarMaterial} disabled={!novoMaterial || materiaisDisponiveis.length === 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
