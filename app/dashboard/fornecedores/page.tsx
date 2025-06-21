"use client"

import { useState, useEffect, useTransition } from "react"
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
  Loader2,
  Power,
  PowerOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getFornecedores, deleteFornecedor, toggleFornecedorStatus, type Fornecedor } from "@/app/actions/fornecedor"

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

// Tipo para ordenação
type SortConfig = {
  key: keyof Fornecedor | ""
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  categoria: string
  status: string
  materiais: string[]
  avaliacao: string
}

export default function FornecedoresPage() {
  // Estados principais
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [filteredFornecedores, setFilteredFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })
  const [filters, setFilters] = useState<Filters>({
    categoria: "",
    status: "",
    materiais: [],
    avaliacao: "",
  })

  // Estados para pesquisa
  const [searchMaterial, setSearchMaterial] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null)

  // Estados para popovers
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Carregar fornecedores
  useEffect(() => {
    async function loadFornecedores() {
      try {
        const data = await getFornecedores()
        setFornecedores(data)
        setFilteredFornecedores(data)
      } catch (error) {
        toast({
          title: "Erro ao carregar fornecedores",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFornecedores()
  }, [])

  // Aplicar filtros e pesquisa
  useEffect(() => {
    let result = fornecedores

    // Filtro por pesquisa geral
    if (searchTerm) {
      result = result.filter(
        (fornecedor) =>
          fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por material
    if (searchMaterial) {
      result = result.filter((fornecedor) =>
        fornecedor.materiais.some((material) => material.nome.toLowerCase().includes(searchMaterial.toLowerCase())),
      )
    }

    // Filtros específicos
    if (filters.categoria) {
      result = result.filter((fornecedor) => fornecedor.categoria === filters.categoria)
    }

    if (filters.status) {
      result = result.filter((fornecedor) => fornecedor.status === filters.status)
    }

    if (filters.materiais.length > 0) {
      result = result.filter((fornecedor) =>
        fornecedor.materiais.some((material) => filters.materiais.includes(material.nome)),
      )
    }

    if (filters.avaliacao) {
      const minRating = Number.parseFloat(filters.avaliacao)
      result = result.filter((fornecedor) => fornecedor.avaliacao >= minRating)
    }

    setFilteredFornecedores(result)
  }, [fornecedores, searchTerm, searchMaterial, filters])

  // Função para renderizar as estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-500 text-yellow-500" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return <div className="flex items-center gap-1">{stars}</div>
  }

  // Função para ordenar
  const requestSort = (key: keyof Fornecedor) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    const sortedData = [...filteredFornecedores].sort((a, b) => {
      const aValue = a[key]
      const bValue = b[key]

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredFornecedores(sortedData)
  }

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      categoria: "",
      status: "",
      materiais: [],
      avaliacao: "",
    })
    setSearchMaterial("")
    setSearchTerm("")
    setFiltersOpen(false)
  }

  // Função para excluir fornecedor
  const handleDelete = async () => {
    if (!fornecedorToDelete) return

    startTransition(async () => {
      const result = await deleteFornecedor(fornecedorToDelete.id.toString())

      if (result.success) {
        toast({
          title: "Fornecedor excluído",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Atualizar lista local
        const updatedFornecedores = fornecedores.filter((f) => f.id !== fornecedorToDelete.id)
        setFornecedores(updatedFornecedores)
        setFilteredFornecedores(updatedFornecedores)
      } else {
        toast({
          title: "Erro ao excluir fornecedor",
          description: result.message,
          variant: "destructive",
        })
      }

      setDeleteDialogOpen(false)
      setFornecedorToDelete(null)
    })
  }

  // Função para alternar status
  const handleToggleStatus = async (fornecedor: Fornecedor) => {
    startTransition(async () => {
      const result = await toggleFornecedorStatus(fornecedor.id.toString())

      if (result.success) {
        toast({
          title: "Status atualizado",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Atualizar lista local
        const updatedFornecedores = fornecedores.map((f) =>
          f.id === fornecedor.id ? { ...f, status: result.status as "Ativo" | "Inativo" } : f,
        )
        setFornecedores(updatedFornecedores)
      } else {
        toast({
          title: "Erro ao atualizar status",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (key: keyof Fornecedor, label: string) => (
    <TableHead className="cursor-pointer select-none">
      <button
        className="flex items-center gap-1 hover:text-primary transition-colors w-full text-left"
        onClick={() => requestSort(key)}
      >
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
    .slice(0, 8)

  // Obter dados únicos para filtros
  const uniqueCategories = Array.from(new Set(fornecedores.map((f) => f.categoria))).sort()
  const uniqueMaterials = Array.from(new Set(fornecedores.flatMap((f) => f.materiais.map((m) => m.nome)))).sort()

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">Gerencie seus fornecedores e materiais</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/fornecedores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {fornecedores.filter((f) => f.status === "Ativo").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <PowerOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fornecedores.filter((f) => f.status === "Inativo").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedores.reduce((total, f) => total + f.orcamentos, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Pesquisa Geral */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, contato ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pesquisa por Material */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Popover open={searchMaterial.length > 0 && materialSuggestions.length > 0}>
            <PopoverTrigger asChild>
              <Input
                type="search"
                placeholder="Buscar por material..."
                className="pl-8"
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
                        onSelect={() => setSearchMaterial(material)}
                        className="cursor-pointer"
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

        {/* Filtros Avançados */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {(filters.categoria || filters.status || filters.materiais.length > 0 || filters.avaliacao) && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {[filters.categoria, filters.status, ...filters.materiais, filters.avaliacao].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>

              <Separator />

              {/* Filtro por Categoria */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoria</Label>
                <Select
                  value={filters.categoria}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {uniqueCategories.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Avaliação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Avaliação Mínima</Label>
                <Select
                  value={filters.avaliacao}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, avaliacao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer avaliação</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="3">3+ estrelas</SelectItem>
                    <SelectItem value="2">2+ estrelas</SelectItem>
                    <SelectItem value="1">1+ estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Materiais */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Materiais</Label>
                <ScrollArea className="h-32 border rounded-md">
                  <div className="p-2 space-y-2">
                    {uniqueMaterials.map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={`material-${material}`}
                          checked={filters.materiais.includes(material)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters((prev) => ({
                                ...prev,
                                materiais: [...prev.materiais, material],
                              }))
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                materiais: prev.materiais.filter((m) => m !== material),
                              }))
                            }
                          }}
                        />
                        <label htmlFor={`material-${material}`} className="text-sm cursor-pointer flex-1">
                          {material}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Info */}
      {(searchTerm ||
        searchMaterial ||
        filters.categoria ||
        filters.status ||
        filters.materiais.length > 0 ||
        filters.avaliacao) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredFornecedores.length} de {fornecedores.length} fornecedores
          </span>
          {filteredFornecedores.length !== fornecedores.length && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {renderSortableHeader("nome", "Nome")}
                {renderSortableHeader("categoria", "Categoria")}
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead className="hidden sm:table-cell">Orçamentos</TableHead>
                {renderSortableHeader("status", "Status")}
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFornecedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p>Nenhum fornecedor encontrado</p>
                      {(searchTerm ||
                        searchMaterial ||
                        filters.categoria ||
                        filters.status ||
                        filters.materiais.length > 0) && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="font-medium min-w-[200px]">
                      <div>
                        <div className="font-medium">{fornecedor.nome}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{fornecedor.contato}</div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Badge variant="outline">{fornecedor.categoria}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell min-w-[150px]">{fornecedor.contato}</TableCell>
                    <TableCell className="hidden lg:table-cell min-w-[130px]">{fornecedor.telefone}</TableCell>
                    <TableCell className="min-w-[120px]">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <Package className="mr-2 h-4 w-4" />
                            {fornecedor.materiais.length}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60">
                          <div className="space-y-3">
                            <h4 className="font-medium">Materiais Fornecidos</h4>
                            <ScrollArea className="h-32">
                              <div className="space-y-1">
                                {fornecedor.materiais.map((material) => (
                                  <div key={material.id} className="text-sm py-1 px-2 bg-muted rounded">
                                    {material.nome}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-2">
                        {renderStars(fornecedor.avaliacao)}
                        <span className="text-sm text-muted-foreground">({fornecedor.avaliacao})</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell min-w-[100px]">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/fornecedores/${fornecedor.id}/orcamentos`}>
                          <FileText className="mr-2 h-4 w-4" />
                          {fornecedor.orcamentos}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Badge variant={fornecedor.status === "Ativo" ? "default" : "secondary"}>
                        {fornecedor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending}>
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
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
                          <DropdownMenuItem onClick={() => handleToggleStatus(fornecedor)}>
                            {fornecedor.status === "Ativo" ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setFornecedorToDelete(fornecedor)
                              setDeleteDialogOpen(true)
                            }}
                          >
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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor "{fornecedorToDelete?.nome}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setFornecedorToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
