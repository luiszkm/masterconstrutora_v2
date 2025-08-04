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
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Package,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  User,
  ChevronLeft,
  ChevronRight,
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
import { deleteOrcamento, updateOrcamentoStatus, getOrcamentos } from "@/app/actions/orcamento"
import type { Orcamento, OrcamentosResponse } from "@/types/orcamento"

// Tipo para ordenação
type SortConfig = {
  key: keyof Orcamento | ""
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  status: string
  fornecedor: string
  obra: string
  valorMin: string
  valorMax: string
  dataInicio: string
  dataFim: string
  categoria: string
}

interface OrcamentosPageClientProps {
  initialData: OrcamentosResponse
}

export function OrcamentosPageClient({ initialData }: OrcamentosPageClientProps) {
  // Estados principais - garantir que sempre sejam arrays
  const [data, setData] = useState<OrcamentosResponse>(initialData)
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialData.dados || [])
  const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>(initialData.dados || [])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(initialData.paginacao?.currentPage || 1)
  const [pageSize, setPageSize] = useState(initialData.paginacao?.pageSize || 20)

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })
  const [filters, setFilters] = useState<Filters>({
    status: "",
    fornecedor: "",
    obra: "",
    valorMin: "",
    valorMax: "",
    dataInicio: "",
    dataFim: "",
    categoria: "",
  })

  // Estados para pesquisa
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<Orcamento | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [orcamentoToUpdate, setOrcamentoToUpdate] = useState<Orcamento | null>(null)
  const [newStatus, setNewStatus] = useState<"Em Aberto" | "Aprovado" | "Rejeitado" | "Cancelado">("Em Aberto")
  const [categoriasDialogOpen, setCategoriasDialogOpen] = useState(false)
  const [selectedOrcamentoCategorias, setSelectedOrcamentoCategorias] = useState<string[]>([])

  // Estados para popovers
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Função para carregar dados da API
  const loadOrcamentos = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true)
    try {
      const result = await getOrcamentos(page, size)
      if ("error" in result) {
        toast({
          title: "Erro ao carregar orçamentos",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setData(result)
        const novosOrcamentos = result.dados || []
        setOrcamentos(novosOrcamentos)
        setFilteredOrcamentos(novosOrcamentos)
        setCurrentPage(result.paginacao?.currentPage || 1)
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar orçamentos",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros e pesquisa (apenas nos dados atuais da página)
  useEffect(() => {
    if (!Array.isArray(orcamentos)) {
      setFilteredOrcamentos([])
      return
    }

    let result = orcamentos

    // Filtro por pesquisa geral
    if (searchTerm) {
      result = result.filter(
        (orcamento) =>
          orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.obraNome.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtros específicos
    if (filters.status) {
      result = result.filter((orcamento) => orcamento.status === filters.status)
    }

    if (filters.fornecedor) {
      result = result.filter((orcamento) =>
        orcamento.fornecedorNome.toLowerCase().includes(filters.fornecedor.toLowerCase()),
      )
    }

    if (filters.obra) {
      result = result.filter((orcamento) => orcamento.obraNome.toLowerCase().includes(filters.obra.toLowerCase()))
    }

    if (filters.valorMin) {
      const valorMin = Number.parseFloat(filters.valorMin)
      result = result.filter((orcamento) => orcamento.valorTotal >= valorMin)
    }

    if (filters.valorMax) {
      const valorMax = Number.parseFloat(filters.valorMax)
      result = result.filter((orcamento) => orcamento.valorTotal <= valorMax)
    }

    if (filters.dataInicio) {
      result = result.filter((orcamento) => new Date(orcamento.dataEmissao) >= new Date(filters.dataInicio))
    }

    if (filters.dataFim) {
      result = result.filter((orcamento) => new Date(orcamento.dataEmissao) <= new Date(filters.dataFim))
    }

    if (filters.categoria) {
      result = result.filter((orcamento) =>
        orcamento.categorias?.some((cat) => cat.toLowerCase().includes(filters.categoria.toLowerCase())),
      )
    }

    setFilteredOrcamentos(result)
  }, [orcamentos, searchTerm, filters])

  // Função para renderizar badge de status
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      "Em Aberto": { variant: "outline" as const, icon: Clock, color: "text-yellow-600" },
      Aprovado: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      Rejeitado: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      Cancelado: { variant: "secondary" as const, icon: Ban, color: "text-gray-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Em Aberto"]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Função para formatar valor
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Função para ordenar
  const requestSort = (key: keyof Orcamento) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    const sortedData = [...filteredOrcamentos].sort((a, b) => {
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

    setFilteredOrcamentos(sortedData)
  }

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      status: "",
      fornecedor: "",
      obra: "",
      valorMin: "",
      valorMax: "",
      dataInicio: "",
      dataFim: "",
      categoria: "",
    })
    setSearchTerm("")
    setFiltersOpen(false)
  }

  // Função para navegar entre páginas
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= data.paginacao.totalPages) {
      loadOrcamentos(newPage, pageSize)
    }
  }

  // Função para alterar tamanho da página
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    loadOrcamentos(1, newSize) // Volta para primeira página
  }

  // Função para excluir orçamento
  const handleDelete = async () => {
    if (!orcamentoToDelete) return

    startTransition(async () => {
      const result = await deleteOrcamento(orcamentoToDelete.id)

      if (result.success) {
        toast({
          title: "Orçamento excluído",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Recarregar dados da página atual
        await loadOrcamentos(currentPage, pageSize)
      } else {
        toast({
          title: "Erro ao excluir orçamento",
          description: result.message,
          variant: "destructive",
        })
      }

      setDeleteDialogOpen(false)
      setOrcamentoToDelete(null)
    })
  }

  // Função para atualizar status
  const handleUpdateStatus = async () => {
    if (!orcamentoToUpdate) return

    startTransition(async () => {
      const result = await updateOrcamentoStatus(orcamentoToUpdate.id, newStatus)

      if (result.success) {
        toast({
          title: "Status atualizado",
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Atualizar lista local
        const updatedOrcamentos = orcamentos.map((o) =>
          o.id === orcamentoToUpdate.id ? { ...o, status: newStatus } : o,
        )
        setOrcamentos(updatedOrcamentos)
      } else {
        toast({
          title: "Erro ao atualizar status",
          description: result.message,
          variant: "destructive",
        })
      }

      setStatusDialogOpen(false)
      setOrcamentoToUpdate(null)
    })
  }

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (key: keyof Orcamento, label: string) => (
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

  // Calcular estatísticas baseadas nos dados da API
  const stats = {
    total: data.paginacao?.totalItens || 0,
    emAberto: Array.isArray(orcamentos) ? orcamentos.filter((o) => o.status === "Em Aberto").length : 0,
    aprovados: Array.isArray(orcamentos) ? orcamentos.filter((o) => o.status === "Aprovado").length : 0,
    // somar apenas os valores dos com status "Aprovado"
    valorTotal: Array.isArray(orcamentos)
      ? orcamentos.reduce((total, o) => (o.status === "Aprovado" ? total + o.valorTotal : total), 0)
      : 0,
  }

  // Obter listas únicas para filtros (baseado nos dados atuais)
  const uniqueFornecedores = Array.isArray(orcamentos)
    ? Array.from(new Set(orcamentos.map((o) => o.fornecedorNome))).sort()
    : []
  const uniqueObras = Array.isArray(orcamentos) ? Array.from(new Set(orcamentos.map((o) => o.obraNome))).sort() : []

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os orçamentos do sistema • {data.paginacao.totalItens} orçamentos encontrados
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/orcamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Página {data.paginacao.currentPage} de {data.paginacao.totalPages}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.emAberto}</div>
            <p className="text-xs text-muted-foreground">Nesta página</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.aprovados}</div>
            <p className="text-xs text-muted-foreground">Nesta página</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValor(stats.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">Nesta página</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pesquisa Geral */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por número, fornecedor ou obra..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros Avançados */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {Object.values(filters).filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {Object.values(filters).filter(Boolean).length}
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
                      <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                      <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Fornecedor */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fornecedor</Label>
                  <Select
                    value={filters.fornecedor}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, fornecedor: value === "all" ? "" : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os fornecedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os fornecedores</SelectItem>
                      {uniqueFornecedores.map((fornecedor) => (
                        <SelectItem key={fornecedor} value={fornecedor}>
                          {fornecedor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Obra */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Obra</Label>
                  <Select
                    value={filters.obra}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, obra: value === "all" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as obras" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as obras</SelectItem>
                      {uniqueObras.map((obra) => (
                        <SelectItem key={obra} value={obra}>
                          {obra}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Categoria */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoria</Label>
                  <Input
                    placeholder="Buscar por categoria..."
                    value={filters.categoria}
                    onChange={(e) => setFilters((prev) => ({ ...prev, categoria: e.target.value }))}
                  />
                </div>

                {/* Filtro por Valor */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Faixa de Valor</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Valor mín."
                      value={filters.valorMin}
                      onChange={(e) => setFilters((prev) => ({ ...prev, valorMin: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Valor máx."
                      value={filters.valorMax}
                      onChange={(e) => setFilters((prev) => ({ ...prev, valorMax: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Filtro por Data */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Período</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.dataInicio}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dataInicio: e.target.value }))}
                    />
                    <Input
                      type="date"
                      value={filters.dataFim}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dataFim: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results Info */}
      {(searchTerm || Object.values(filters).some(Boolean)) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredOrcamentos.length} de {orcamentos.length} orçamentos desta página
          </span>
          {filteredOrcamentos.length !== orcamentos.length && (
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
                {renderSortableHeader("numero", "Número")}
                {renderSortableHeader("fornecedorNome", "Fornecedor")}
                {renderSortableHeader("obraNome", "Obra")}
                <TableHead className="hidden md:table-cell">Itens</TableHead>
                {renderSortableHeader("valorTotal", "Valor Total")}
                {renderSortableHeader("dataEmissao", "Data")}
                {renderSortableHeader("status", "Status")}
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Carregando orçamentos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrcamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p>Nenhum orçamento encontrado</p>
                      {(searchTerm || Object.values(filters).some(Boolean)) && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium min-w-[150px]">
                      <div>
                        <div className="font-medium">{orcamento.numero}</div>
                        <div className="text-xs text-muted-foreground">ID: {orcamento.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{orcamento.fornecedorNome}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {orcamento.fornecedorId.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{orcamento.obraNome}</div>
                          <div className="text-xs text-muted-foreground">ID: {orcamento.obraId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell min-w-[80px]">
                      <button
                        className="w-full"
                        onClick={() => {
                          setSelectedOrcamentoCategorias(orcamento.categorias || [])
                          setCategoriasDialogOpen(true)
                        }}
                      >
                        <Badge variant="outline" className="flex items-center gap-1 cursor-pointer hover:bg-secondary">
                          <Package className="h-3 w-3" />
                          {orcamento.itensCount}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="font-medium min-w-[120px]">{formatarValor(orcamento.valorTotal)}</TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatarData(orcamento.dataEmissao)}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">{renderStatusBadge(orcamento.status)}</TableCell>
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
                            <Link href={`/dashboard/orcamentos/${orcamento.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setOrcamentoToUpdate(orcamento)
                              setNewStatus(orcamento.status)
                              setStatusDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Alterar Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setOrcamentoToDelete(orcamento)
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
      {data.paginacao.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, data.paginacao.totalItens)} de {data.paginacao.totalItens} orçamentos
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Itens por página:</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {/* Mostrar páginas próximas */}
                {Array.from({ length: Math.min(5, data.paginacao.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, currentPage - 2)
                  const pageNumber = startPage + i
                  if (pageNumber > data.paginacao.totalPages) return null

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= data.paginacao.totalPages || loading}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o orçamento "{orcamentoToDelete?.numero}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setOrcamentoToDelete(null)
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

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status do Orçamento</DialogTitle>
            <DialogDescription>Altere o status do orçamento "{orcamentoToUpdate?.numero}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Novo Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as "Em Aberto" | "Aprovado" | "Rejeitado" | "Cancelado")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false)
                setOrcamentoToUpdate(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categorias Dialog */}
      <Dialog open={categoriasDialogOpen} onOpenChange={setCategoriasDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorias do Orçamento</DialogTitle>
            <DialogDescription>
              Lista de categorias de itens presentes neste orçamento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedOrcamentoCategorias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedOrcamentoCategorias.map((categoria, index) => (
                  <Badge key={index} variant="secondary">
                    {categoria}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma categoria informada.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoriasDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
