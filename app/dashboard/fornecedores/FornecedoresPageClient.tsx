'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
  MapPin,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { toast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  deleteFornecedor,
  getCategorias,
  getFornecedores
} from '@/app/actions/fornecedor'
import type { Fornecedor, FornecedoresResponse } from '@/types/fornecedor'
import { CategoryBadges } from '@/components/categoryBadges'
import { usePagination } from '@/hooks/usePagination'

// Tipo para ordenação
type SortConfig = {
  key: keyof Fornecedor | ''
  direction: 'asc' | 'desc'
}

// Tipo para filtros
type Filters = {
  categoria: string
  status: string
  avaliacao: string
}

// Tipo para categoria da API
type Categoria = {
  ID: string
  Nome: string
  createdAt: string
  updatedAt: string
}

interface FornecedoresPageClientProps {
  readonly initialData: FornecedoresResponse
}

export function FornecedoresPageClient({
  initialData
}: FornecedoresPageClientProps) {
  const safeInitialData = {
    dados: initialData?.dados || [],
    paginacao: initialData?.paginacao || {
      totalItens: initialData?.dados?.length || 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: initialData?.dados?.length || 20
    }
  }
  // Estados para categorias da API
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  // Carregar categorias da API
  useEffect(() => {
    async function loadCategorias() {
      try {
        const categoriasData = await getCategorias()
        if (!('error' in categoriasData)) {
          const categoriesArray = Array.isArray(categoriasData)
            ? categoriasData
            : []
          setCategorias(categoriesArray)
        } else {
          console.error('Erro ao carregar categorias:', categoriasData.error)
          toast({
            title: 'Erro ao carregar categorias',
            description: categoriasData.error,
            variant: 'destructive'
          })
          setCategorias([])
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        toast({
          title: 'Erro ao carregar categorias',
          description: 'Tente novamente em alguns instantes',
          variant: 'destructive'
        })
      } finally {
        setLoadingCategorias(false)
      }
    }
    loadCategorias()
  }, [])

  // Estados principais - garantir que sempre sejam arrays válidos
  const [data, setData] = useState<FornecedoresResponse>(safeInitialData)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(
    safeInitialData.dados || []
  )
  const [filteredFornecedores, setFilteredFornecedores] = useState<
    Fornecedor[]
  >(safeInitialData.dados || [])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'asc'
  })
  const [filters, setFilters] = useState<Filters>({
    categoria: '',
    status: '',
    avaliacao: ''
  })

  // Estados para pesquisa
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCategoria, setSearchCategoria] = useState('')

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fornecedorToDelete, setFornecedorToDelete] =
    useState<Fornecedor | null>(null)

  // Estados para popovers
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Função para carregar dados da API
  const loadFornecedores = async (
    page: number = currentPage,
    size: number = pageSize
  ) => {
    setLoading(true)
    try {
      const result = await getFornecedores(page, size)
      if ('error' in result) {
        toast({
          title: 'Erro ao carregar fornecedores',
          description: result.error,
          variant: 'destructive'
        })
      } else {
        setData(result)
        const novosFornecedores = result.dados || []
        setFornecedores(novosFornecedores)
        setFilteredFornecedores(novosFornecedores)
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar fornecedores',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Extrair nomes das categorias para os filtros
  const uniqueCategories = React.useMemo(() => {
    if (!Array.isArray(categorias)) return []
    return categorias.map(cat => cat.Nome).sort()
  }, [categorias])

  // Aplicar filtros e pesquisa
  useEffect(() => {
    if (!Array.isArray(fornecedores)) {
      setFilteredFornecedores([])
      return
    }

    let result = fornecedores

    // Filtro por pesquisa geral
    if (searchTerm) {
      result = result.filter(
        fornecedor =>
          (fornecedor.nome &&
            fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (fornecedor.contato &&
            fornecedor.contato
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (fornecedor.email &&
            fornecedor.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (fornecedor.cnpj && fornecedor.cnpj.includes(searchTerm))
      )
    }

    // Filtro por pesquisa de categoria
    if (searchCategoria) {
      result = result.filter(fornecedor =>
        fornecedor.categorias && Array.isArray(fornecedor.categorias)
          ? fornecedor.categorias.some(
              cat =>
                cat &&
                cat.Nome &&
                cat.Nome.toLowerCase().includes(searchCategoria.toLowerCase())
            )
          : false
      )
    }

    // Filtros específicos
    if (filters.categoria) {
      result = result.filter(fornecedor =>
        fornecedor.categorias && Array.isArray(fornecedor.categorias)
          ? fornecedor.categorias.some(
              cat => cat && cat.Nome === filters.categoria
            )
          : false
      )
    }

    if (filters.status) {
      result = result.filter(fornecedor => fornecedor.status === filters.status)
    }

    if (filters.avaliacao) {
      const minRating = Number.parseFloat(filters.avaliacao)
      result = result.filter(
        fornecedor =>
          fornecedor.avaliacao !== null &&
          fornecedor.avaliacao !== undefined &&
          fornecedor.avaliacao >= minRating
      )
    }

    setFilteredFornecedores(result)
  }, [fornecedores, searchTerm, searchCategoria, filters])

  // Função para renderizar as estrelas de avaliação
  const renderStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) {
      return (
        <span className="text-sm text-muted-foreground">Sem avaliação</span>
      )
    }

    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-500 text-yellow-500"
        />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-4 w-4 fill-yellow-500 text-yellow-500"
        />
      )
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
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedData = [...filteredFornecedores].sort((a, b) => {
      const aValue = a[key]
      const bValue = b[key]

      if (
        (aValue === null || aValue === undefined) &&
        (bValue === null || bValue === undefined)
      )
        return 0
      if (aValue === null) return direction === 'asc' ? 1 : -1
      if (bValue === null) return direction === 'asc' ? -1 : 1

      // Handle undefined values explicitly
      if (aValue === undefined && bValue !== undefined)
        return direction === 'asc' ? 1 : -1
      if (aValue !== undefined && bValue === undefined)
        return direction === 'asc' ? -1 : 1
      if (aValue === undefined && bValue === undefined) return 0

      if (aValue! < bValue!) {
        return direction === 'asc' ? -1 : 1
      }
      if (aValue! > bValue!) {
        return direction === 'asc' ? 1 : -1
      }
      return 0
    })

    setFilteredFornecedores(sortedData)
  }

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      categoria: '',
      status: '',
      avaliacao: ''
    })
    setSearchTerm('')
    setSearchCategoria('')
    setFiltersOpen(false)
  }
  // hook personalizado paginacao
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    usePagination({
      initialPage: safeInitialData.paginacao.currentPage,
      initialPageSize: safeInitialData.paginacao.pageSize,
      totalPages: data.paginacao?.totalPages || 1,
      onLoad: loadFornecedores
    })

  // Função para excluir fornecedor
  const handleDelete = async () => {
    if (!fornecedorToDelete) return

    startTransition(async () => {
      const result = await deleteFornecedor(fornecedorToDelete.id!)

      if (result.success) {
        toast({
          title: 'Fornecedor excluído',
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>
        })

        // Recarregar dados da página atual
        await loadFornecedores(currentPage, pageSize)
      } else {
        toast({
          title: 'Erro ao excluir fornecedor',
          description: result.message,
          variant: 'destructive'
        })
      }

      setDeleteDialogOpen(false)
      setFornecedorToDelete(null)
    })
  }

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (key: keyof Fornecedor, label: string) => {
    let sortIcon: React.ReactNode = <div className="w-4" />
    if (sortConfig.key === key) {
      sortIcon =
        sortConfig.direction === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
    }
    return (
      <TableHead className="cursor-pointer select-none">
        <button
          className="flex items-center gap-1 hover:text-primary transition-colors w-full text-left"
          onClick={() => requestSort(key)}
        >
          {label}
          {sortIcon}
        </button>
      </TableHead>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Fornecedores
          </h2>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores e categorias
          </p>
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
            <div className="text-2xl font-bold">
              {data.paginacao?.totalItens || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Página {data.paginacao?.currentPage || 1} de{' '}
              {data.paginacao?.totalPages || 1}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {fornecedores.filter(f => f.status === 'Ativo').length}
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
              {fornecedores.filter(f => f.status === 'Inativo').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fornecedores.reduce(
                (total, f) => total + (f.orcamentosCount || 0),
                0
              )}
            </div>
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
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Pesquisa por Categoria */}
          <div className="relative flex-1">
            <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por categoria..."
              className="pl-8"
              value={searchCategoria}
              onChange={e => setSearchCategoria(e.target.value)}
            />
          </div>
        </div>

        {/* Segunda linha - Filtros Avançados */}
        <div className="flex justify-end">
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avançados
                {(filters.categoria || filters.status || filters.avaliacao) && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {
                      [
                        filters.categoria,
                        filters.status,
                        filters.avaliacao
                      ].filter(Boolean).length
                    }
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
                    onValueChange={value =>
                      setFilters(prev => ({
                        ...prev,
                        categoria: value === 'all' ? '' : value
                      }))
                    }
                    disabled={loadingCategorias}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingCategorias
                            ? 'Carregando...'
                            : 'Todas as categorias'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {uniqueCategories.map(categoria => (
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
                    onValueChange={value =>
                      setFilters(prev => ({
                        ...prev,
                        status: value === 'all' ? '' : value
                      }))
                    }
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
                  <Label className="text-sm font-medium">
                    Avaliação Mínima
                  </Label>
                  <Select
                    value={filters.avaliacao}
                    onValueChange={value =>
                      setFilters(prev => ({
                        ...prev,
                        avaliacao: value === 'any' ? '' : value
                      }))
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
      {(searchTerm ||
        searchCategoria ||
        filters.categoria ||
        filters.status ||
        filters.avaliacao) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredFornecedores.length} de {fornecedores.length}{' '}
            fornecedores
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
                {renderSortableHeader('nome', 'Nome')}
                <TableHead>Categorias</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden xl:table-cell">CNPJ</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Orçamentos
                </TableHead>
                {renderSortableHeader('status', 'Status')}
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
                        searchCategoria ||
                        filters.categoria ||
                        filters.status ||
                        filters.avaliacao) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFornecedores.map(fornecedor => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="font-medium min-w-[200px]">
                      <div>
                        <div className="font-medium">{fornecedor.nome}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {fornecedor.contato}
                        </div>
                        {fornecedor.endereco && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {fornecedor.endereco}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <CategoryBadges categorias={fornecedor.categorias} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell min-w-[150px]">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {fornecedor.contato || 'Não informado'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell min-w-[200px]">
                      <div>{fornecedor.email || 'Não informado'}</div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell min-w-[150px]">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {fornecedor.cnpj}
                      </code>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      {renderStars(fornecedor.avaliacao)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell min-w-[100px]">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/fornecedores/${fornecedor.id}/orcamentos`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {fornecedor.orcamentosCount || 0}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Badge
                        variant={
                          fornecedor.status === 'Ativo'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {fornecedor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                          >
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
                            <Link
                              href={`/dashboard/fornecedores/${fornecedor.id}/editar`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
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

      {/* Pagination */}
      <DataTablePagination
        totalItems={data.paginacao?.totalItens || 0}
        totalPages={data.paginacao?.totalPages || 1}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor &ldquo;
              {fornecedorToDelete?.nome}&rdquo;? Esta ação não pode ser
              desfeita.
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
