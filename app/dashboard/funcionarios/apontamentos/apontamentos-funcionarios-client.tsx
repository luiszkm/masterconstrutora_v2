"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import {
  Search,
  ArrowLeft,
  Filter,
  ChevronDown,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  MoreHorizontal,
  Eye,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import type { Apontamento } from "@/app/actions/funcionario"
import { getApontamentos } from "@/app/actions/funcionario"
import { aplicarMascaraMonetaria } from "@/app/lib/masks"

// Status disponíveis para filtro
const statusOptions = ["EM_ABERTO", "PAGO", "CANCELADO"]

// Função para obter a cor do status
const getStatusColor = (status: string) => {
  switch (status) {
    case "EM_ABERTO":
      return "bg-yellow-500"
    case "PAGO":
      return "bg-green-500"
    case "CANCELADO":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Função para formatar o status
const formatStatus = (status: string) => {
  switch (status) {
    case "EM_ABERTO":
      return "Em Aberto"
    case "PAGO":
      return "Pago"
    case "CANCELADO":
      return "Cancelado"
    default:
      return status
  }
}

interface ApontamentosFuncionarioClientProps {
  initialData: {
    dados: Apontamento[]
    paginacao?: {
      totalItens: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }
}

export default function ApontamentosFuncionariosClient({ initialData }: ApontamentosFuncionarioClientProps) {
  // Ensure we have properly formatted data with fallbacks
  const safeInitialData = {
    dados: initialData?.dados || [],
    paginacao: initialData?.paginacao || {
      totalItens: initialData?.dados?.length || 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: initialData?.dados?.length || 20
    }
  }

  console.log("Apontamentos:", safeInitialData)

  // Estados principais
  const [data, setData] = useState(safeInitialData)
  const [apontamentos, setApontamentos] = useState(safeInitialData.dados || [])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(safeInitialData.paginacao.currentPage)
  const [pageSize, setPageSize] = useState(safeInitialData.paginacao.pageSize)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])

  // Filtros de data para API
  const [dataInicio, setDataInicio] = useState<string>("")
  const [dataFim, setDataFim] = useState<string>("")

  // Função para carregar dados da API
  const loadApontamentos = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true)
    try {
      const params: any = {
        page: page.toString(),
        pageSize: size.toString()
      }

      // Add date filters if set
      if (dataInicio) params.dataInicio = dataInicio
      if (dataFim) params.dataFim = dataFim

      const result = await getApontamentos(params)
      if ("error" in result) {
        toast({
          title: "Erro ao carregar apontamentos",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setData(result)
        setApontamentos(result.dados || [])
        if (result.paginacao) {
          setCurrentPage(result.paginacao.currentPage)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar apontamentos:", error)
      toast({
        title: "Erro ao carregar apontamentos",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para mudar página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data.paginacao?.totalPages || 1)) {
      setCurrentPage(newPage)
      loadApontamentos(newPage, pageSize)
    }
  }

  // Função para alterar tamanho da página
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    loadApontamentos(1, newSize) // Volta para primeira página
  }

  // Função para aplicar filtros de data
  const handleDateFilter = () => {
    setCurrentPage(1) // Reset to first page
    loadApontamentos(1, pageSize)
  }

  // Função para limpar filtros de data
  const clearDateFilters = () => {
    setDataInicio("")
    setDataFim("")
    setCurrentPage(1)
    loadApontamentos(1, pageSize)
  }

  // Filtrar apontamentos
  const apontamentosFiltrados = (Array.isArray(apontamentos) ? apontamentos : []).filter((apontamento) => {
    const matchesSearch =
      apontamento.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apontamento.periodoInicio && apontamento.periodoInicio.includes(searchTerm)) ||
      (apontamento.periodoFim && apontamento.periodoFim.includes(searchTerm))

    const matchesStatus = filtroStatus.length === 0 || filtroStatus.includes(apontamento.status)

    return matchesSearch && matchesStatus
  })

  // Calcular totais
  const totalGeral = apontamentosFiltrados.reduce((total, apontamento) => {
    const valorTotal =
      apontamento.diaria * apontamento.diasTrabalhados +
      apontamento.adicionais -
      apontamento.descontos -
      apontamento.adiantamentos
    return total + valorTotal
  }, 0)

  const totalPago = apontamentosFiltrados
    .filter((a) => a.status === "PAGO")
    .reduce((total, apontamento) => {
      const valorTotal =
        apontamento.diaria * apontamento.diasTrabalhados +
        apontamento.adicionais -
        apontamento.descontos -
        apontamento.adiantamentos
      return total + valorTotal
    }, 0)

  const totalEmAberto = apontamentosFiltrados
    .filter((a) => a.status === "EM_ABERTO")
    .reduce((total, apontamento) => {
      const valorTotal =
        apontamento.diaria * apontamento.diasTrabalhados +
        apontamento.adicionais -
        apontamento.descontos -
        apontamento.adiantamentos
      return total + valorTotal
    }, 0)

  const totalApontamentos = apontamentosFiltrados.length

  const toggleStatus = (status: string) => {
    setFiltroStatus((current) => {
      if (current.includes(status)) {
        return current.filter((s) => s !== status)
      } else {
        return [...current, status]
      }
    })
  }

  const limparFiltros = () => {
    setFiltroStatus([])
    setSearchTerm("")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/funcionarios">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          
        </div>
      </div>

      {/* Cards com totais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Apontamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApontamentos}</div>
            <p className="text-xs text-muted-foreground">apontamentos encontrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">soma de todos os apontamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">apontamentos já pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalEmAberto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">aguardando pagamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por período ou detalhes..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros de Data */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex gap-2 items-center">
            <Label htmlFor="dataInicio" className="text-sm font-medium whitespace-nowrap">
              Data Início:
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Label htmlFor="dataFim" className="text-sm font-medium whitespace-nowrap">
              Data Fim:
            </Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDateFilter}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button
              onClick={clearDateFilters}
              variant="ghost"
              size="sm"
              disabled={loading || (!dataInicio && !dataFim)}
            >
              Limpar
            </Button>
          </div>
        </div>
        <Popover open={filtroAberto} onOpenChange={setFiltroAberto}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrar por</h4>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Status</h5>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filtroStatus.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {formatStatus(status)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
                <Button size="sm" onClick={() => setFiltroAberto(false)}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tabela de apontamentos */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Período</TableHead>
                <TableHead className="min-w-[100px]">Diária (R$)</TableHead>
                <TableHead className="min-w-[120px]">Dias Trabalhados</TableHead>
                <TableHead className="min-w-[140px]">Valor Adicional (R$)</TableHead>
                <TableHead className="min-w-[100px]">Descontos (R$)</TableHead>
                <TableHead className="min-w-[120px]">Adiantamento (R$)</TableHead>
                <TableHead className="min-w-[120px]">Valor Total (R$)</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="text-right min-w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apontamentosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Nenhum apontamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                apontamentosFiltrados.map((apontamento, index) => {
                  const valorTotal =
                    apontamento.diaria * apontamento.diasTrabalhados +
                    apontamento.adicionais -
                    apontamento.descontos -
                    apontamento.adiantamentos

                  return (
                    <TableRow key={apontamento.apontamentoId || `apontamento-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {apontamento.periodoInicio && apontamento.periodoFim ? (
                              <>
                                {format(new Date(apontamento.periodoInicio), "dd/MM/yyyy")} -{" "}
                                {format(new Date(apontamento.periodoFim), "dd/MM/yyyy")}
                              </>
                            ) : (
                              "Período não definido"
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{aplicarMascaraMonetaria(apontamento.diaria)}</TableCell>
                      <TableCell>{apontamento.diasTrabalhados}</TableCell>
                      <TableCell>{aplicarMascaraMonetaria(apontamento.adicionais)}</TableCell>
                      <TableCell>{aplicarMascaraMonetaria(apontamento.descontos)}</TableCell>
                      <TableCell>{aplicarMascaraMonetaria(apontamento.adiantamentos)}</TableCell>
                      <TableCell className="font-medium">
                        R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(apontamento.status)} text-white`}
                        >
                          {formatStatus(apontamento.status)}
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
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Baixar Comprovante
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginação */}
      <DataTablePagination
        totalItems={data.paginacao?.totalItens || 0}
        totalPages={data.paginacao?.totalPages || 1}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
