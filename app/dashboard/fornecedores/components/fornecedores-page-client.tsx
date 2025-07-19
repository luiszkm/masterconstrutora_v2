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
  Globe,
  MapPin,
  User,
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
import { Separator } from "@/components/ui/separator"
import { deleteFornecedor, toggleFornecedorStatus } from "@/app/actions/fornecedor"
import type { Fornecedor } from "@/types/fornecedor"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

// Tipo para ordenação
type SortConfig = {
  key: keyof Fornecedor | ""
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  categoria: string
  status: string
  avaliacao: string
}

export function FornecedoresPageClient({ initialFornecedores }: { initialFornecedores: Fornecedor[] }) {
  // Estados principais
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialFornecedores)
  const [filteredFornecedores, setFilteredFornecedores] = useState<Fornecedor[]>(initialFornecedores)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })
  const [filters, setFilters] = useState<Filters>({
    categoria: "",
    status: "",
    avaliacao: "",
  })

  // Estados para pesquisa
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategoria, setSearchCategoria] = useState("")

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null)

  // Estados para popovers
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Aplicar filtros e pesquisa
  useEffect(() => {
    let result = fornecedores

    // Filtro por pesquisa geral
    if (searchTerm) {
      result = result.filter(
        (fornecedor) =>
          fornecedor.Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fornecedor.Contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fornecedor.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fornecedor.CNPJ.includes(searchTerm),
      )
    }

    // Filtro por pesquisa de categoria
    if (searchCategoria) {
      result = result.filter((fornecedor) =>
        fornecedor.Categorias.some((cat) => cat.Nome.toLowerCase().includes(searchCategoria.toLowerCase())),
      )
    }

    // Filtros específicos
    if (filters.categoria) {
      result = result.filter((fornecedor) => fornecedor.Categorias.some((cat) => cat.Nome === filters.categoria))
    }

    if (filters.status) {
      result = result.filter((fornecedor) => fornecedor.Status === filters.status)
    }

    if (filters.avaliacao) {
      const minRating = Number.parseFloat(filters.avaliacao)
      result = result.filter((fornecedor) => fornecedor.Avaliacao !== null && fornecedor.Avaliacao >= minRating)
    }

    setFilteredFornecedores(result)
  }, [fornecedores, searchTerm, searchCategoria, filters])

  // Função para renderizar as estrelas de avaliação
  const renderStars = (rating: number | null) => {
    if (rating === null) {
      return <span className="text-sm text-muted-foreground">Sem avaliação</span>
    }

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

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    )
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

      if (aValue === null && bValue === null) return 0
      if (aValue === null) return direction === "asc" ? 1 : -1
      if (bValue === null) return direction === "asc" ? -1 : 1

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
      avaliacao: "",
    })
    setSearchTerm("")
    setSearchCategoria("")
    setFiltersOpen(false)
  }

  // Função para excluir fornecedor
  const handleDelete = async () => {
    if (!fornecedorToDelete) return

    startTransition(async () => {
      const result = await deleteFornecedor(fornecedorToDelete.ID)

      if (result.success) {
        toast({
          title: "Fornecedor excluído",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Atualizar lista local
        const updatedFornecedores = fornecedores.filter((f) => f.ID !== fornecedorToDelete.ID)
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
      const result = await toggleFornecedorStatus(fornecedor.ID)

      if (result.success) {
        toast({
          title: "Status atualizado",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Atualizar lista local
        const updatedFornecedores = fornecedores.map((f) =>
          f.ID === fornecedor.ID ? { ...f, Status: result.status as "Ativo" | "Inativo" } : f,
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

  // Obter dados únicos para filtros
  const uniqueCategories = Array.from(new Set(fornecedores.flatMap((f) => f.Categorias.map((cat) => cat.Nome)))).sort()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">Gerencie seus fornecedores e categorias</p>
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
              {fornecedores.filter((f) => f.Status === "Ativo").length}
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
              {fornecedores.filter((f) => f.Status === "Inativo").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedores.reduce((total, f) => total + f.orcamentosCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Primeira linha - Pesquisa Geral e Categoria */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pesquisa Geral */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, contato, email ou CNPJ..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Pesquisa por Categoria */}
          <div className="relative flex-1">
            <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Popover
              open={
                searchCategoria.length > 0 &&
                uniqueCategories.filter((cat) => cat.toLowerCase().includes(searchCategoria.toLowerCase())).length > 0
              }
            >
              <PopoverTrigger asChild>
                <Input
                  type="search"
                  placeholder="Buscar por categoria..."
                  className="pl-8"
                  value={searchCategoria}
                  onChange={(e) => setSearchCategoria(e.target.value)}
                />
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {uniqueCategories
                        .filter((categoria) => categoria.toLowerCase().includes(searchCategoria.toLowerCase()))
                        .slice(0, 8)
                        .map((categoria) => (
                          <CommandItem
                            key={categoria}
                            onSelect={() => setSearchCategoria(categoria)}
                            className="cursor-pointer"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            {categoria}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Segunda linha - Filtros Avançados */}
        <div className="flex justify-end">
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avançados
                {(filters.categoria || filters.status || filters.avaliacao) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {[filters.categoria, filters.status, filters.avaliacao].filter(Boolean).length}
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
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, categoria: value === "all" ? "" : value }))
                    }
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
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }))}
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
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, avaliacao: value === "any" ? "" : value }))
                    }
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
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results Info */}
      {(searchTerm || searchCategoria || filters.categoria || filters.status || filters.avaliacao) && (
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
                {renderSortableHeader("Nome", "Nome")}
                <TableHead>Categorias</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden xl:table-cell">CNPJ</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead className="hidden sm:table-cell">Orçamentos</TableHead>
                {renderSortableHeader("Status", "Status")}
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
                      {(searchTerm || searchCategoria || filters.categoria || filters.status || filters.avaliacao) && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.ID}>
                    <TableCell className="font-medium min-w-[200px]">
                      <div>
                        <div className="font-medium">{fornecedor.Nome}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{fornecedor.Contato}</div>
                        {fornecedor.Endereco && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {fornecedor.Endereco}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="flex flex-wrap gap-1">
                        {fornecedor.Categorias.length > 0 ? (
                          fornecedor.Categorias.map((categoria) => (
                            <Badge key={categoria.ID} variant="outline" className="text-xs">
                              {categoria.Nome}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sem categoria</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell min-w-[150px]">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {fornecedor.Contato}
                      </div>
                      {fornecedor.NomeAtendente && (
                        <div className="text-xs text-muted-foreground mt-1">Atendente: {fornecedor.NomeAtendente}</div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell min-w-[200px]">
                      <div>{fornecedor.Email}</div>
                      {fornecedor.Website && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Globe className="h-3 w-3" />
                          <a
                            href={fornecedor.Website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell min-w-[150px]">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{fornecedor.CNPJ}</code>
                    </TableCell>
                    <TableCell className="min-w-[120px]">{renderStars(fornecedor.Avaliacao)}</TableCell>
                    <TableCell className="hidden sm:table-cell min-w-[100px]">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/fornecedores/${fornecedor.ID}/orcamentos`}>
                          <FileText className="mr-2 h-4 w-4" />
                          {fornecedor.orcamentosCount}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Badge variant={fornecedor.Status === "Ativo" ? "default" : "secondary"}>
                        {fornecedor.Status}
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
                            <Link href={`/dashboard/fornecedores/${fornecedor.ID}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(fornecedor)}>
                            {fornecedor.Status === "Ativo" ? (
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
              Tem certeza que deseja excluir o fornecedor "{fornecedorToDelete?.Nome}"? Esta ação não pode ser desfeita.
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
