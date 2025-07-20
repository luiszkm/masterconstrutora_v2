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
import { deleteOrcamento, updateOrcamentoStatus } from "@/app/actions/orcamento"
import type { Orcamento } from "@/types/orcamento"

// Tipo para ordenação
type SortConfig = {
  key: keyof Orcamento | ""
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  status: string
  valorMin: string
  valorMax: string
  dataInicio: string
  dataFim: string
}

export function OrcamentosPageClient({ initialOrcamentos }: { initialOrcamentos: Orcamento[] }) {
  // Estados principais
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialOrcamentos)
  const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>(initialOrcamentos)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })
  const [filters, setFilters] = useState<Filters>({
    status: "",
    valorMin: "",
    valorMax: "",
    dataInicio: "",
    dataFim: "",
  })

  // Estados para pesquisa
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<Orcamento | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [orcamentoToUpdate, setOrcamentoToUpdate] = useState<Orcamento | null>(null)
  const [newStatus, setNewStatus] = useState<"Em Aberto" | "Aprovado" | "Rejeitado" | "Cancelado">("Em Aberto")

  // Estados para popovers
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Aplicar filtros e pesquisa
  useEffect(() => {
    let result = orcamentos

    // Filtro por pesquisa geral
    if (searchTerm) {
      result = result.filter(
        (orcamento) =>
          orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtros específicos
    if (filters.status) {
      result = result.filter((orcamento) => orcamento.status === filters.status)
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
      valorMin: "",
      valorMax: "",
      dataInicio: "",
      dataFim: "",
    })
    setSearchTerm("")
    setFiltersOpen(false)
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

        // Atualizar lista local
        const updatedOrcamentos = orcamentos.filter((o) => o.id !== orcamentoToDelete.id)
        setOrcamentos(updatedOrcamentos)
        setFilteredOrcamentos(updatedOrcamentos)
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

  // Calcular estatísticas
  const stats = {
    total: orcamentos.length,
    emAberto: orcamentos.filter((o) => o.status === "Em Aberto").length,
    aprovados: orcamentos.filter((o) => o.status === "Aprovado").length,
    valorTotal: orcamentos.reduce((total, o) => total + o.valorTotal, 0),
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">Gerencie todos os orçamentos do sistema</p>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.emAberto}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.aprovados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValor(stats.valorTotal)}</div>
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
              placeholder="Buscar por número do orçamento..."
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
                {(filters.status || filters.valorMin || filters.valorMax || filters.dataInicio || filters.dataFim) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {
                      [filters.status, filters.valorMin, filters.valorMax, filters.dataInicio, filters.dataFim].filter(
                        Boolean,
                      ).length
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
      {(searchTerm ||
        filters.status ||
        filters.valorMin ||
        filters.valorMax ||
        filters.dataInicio ||
        filters.dataFim) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredOrcamentos.length} de {orcamentos.length} orçamentos
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
                <TableHead>Fornecedor</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="hidden md:table-cell">Itens</TableHead>
                {renderSortableHeader("valorTotal", "Valor Total")}
                {renderSortableHeader("dataEmissao", "Data")}
                {renderSortableHeader("status", "Status")}
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrcamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p>Nenhum orçamento encontrado</p>
                      {(searchTerm ||
                        filters.status ||
                        filters.valorMin ||
                        filters.valorMax ||
                        filters.dataInicio ||
                        filters.dataFim) && (
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
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          ID: {orcamento.fornecedorId.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell min-w-[80px]">
                      <Badge variant="outline">{orcamento.itensCount} itens</Badge>
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
    </div>
  )
}
