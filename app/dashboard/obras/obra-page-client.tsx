"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  Edit,
  MoreHorizontal,
  FileText,
  Filter,
  ChevronDown,
  Building,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  UserPlus,
  LinkIcon,
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

// Actions
import {
  getObrasList,
  excluirObra,
  alocarFuncionario,
  linkarOrcamento,
  concluirProximaEtapa,
  type ObraListItem,
  type ObraListResponse,
} from "@/app/actions/obra"

// Dados mockados estruturados para fácil transição
const mockData = {
  funcionarios: [
    { id: 1, nome: "João Silva", cargo: "Pedreiro", disponivel: true },
    { id: 2, nome: "Maria Oliveira", cargo: "Engenheira Civil", disponivel: true },
    { id: 3, nome: "Carlos Santos", cargo: "Eletricista", disponivel: true },
    { id: 4, nome: "Ana Pereira", cargo: "Arquiteta", disponivel: false },
    { id: 5, nome: "Pedro Souza", cargo: "Mestre de Obras", disponivel: true },
  ],
  orcamentos: [
    { id: 1, numero: "ORC-2024-001", valor: 125000, status: "aprovado" },
    { id: 2, numero: "ORC-2024-002", valor: 85000, status: "pendente" },
    { id: 3, numero: "ORC-2024-003", valor: 200000, status: "aprovado" },
    { id: 4, numero: "ORC-2024-004", valor: 150000, status: "rejeitado" },
    { id: 5, numero: "ORC-2024-005", valor: 95000, status: "aprovado" },
  ],
}

export function ObrasPageClient({ initialData }: { initialData?: ObraListResponse }) {
  // Estados
  const [obras, setObras] = useState<ObraListItem[]>(initialData?.dados || [])
  const [paginacao, setPaginacao] = useState(
    initialData?.paginacao || {
      totalItens: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 20,
    },
  )
  const [loading, setLoading] = useState(!initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [filtroEtapa, setFiltroEtapa] = useState<string[]>([])

  // Estados para diálogos de ações rápidas
  const [alocarDialogAberto, setAlocarDialogAberto] = useState(false)
  const [linkarDialogAberto, setLinkarDialogAberto] = useState(false)
  const [obraSelecionada, setObraSelecionada] = useState<ObraListItem | null>(null)
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState<string[]>([])
  const [orcamentosSelecionados, setOrcamentosSelecionados] = useState<string[]>([])

  const carregarObras = async (page = 1) => {
    setLoading(true)
    try {
      const result = await getObrasList(page, paginacao.pageSize)

      if (result.success && result.data) {
        setObras(result.data.dados)
        setPaginacao(result.data.paginacao)
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível carregar as obras",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar obras",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialData) {
      carregarObras()
    }
  }, [])

  // Obter valores únicos para filtros
  const statusDisponiveis = Array.from(new Set(obras.map((obra) => obra.status))).sort()
  const etapasDisponiveis = Array.from(
    new Set(obras.map((obra) => obra.etapa).filter((etapa) => etapa !== "N/A")),
  ).sort()

  // Filtrar obras localmente (para busca rápida)
  const filtrarObras = () => {
    return obras.filter((obra) => {
      const matchesSearch =
        obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.cliente.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filtroStatus.length === 0 || filtroStatus.includes(obra.status)
      const matchesEtapa = filtroEtapa.length === 0 || filtroEtapa.includes(obra.etapa)

      return matchesSearch && matchesStatus && matchesEtapa
    })
  }

  const obrasFiltradas = filtrarObras()

  // Calcular estatísticas baseadas nos dados do backend
  const totalObras = paginacao.totalItens
  const obrasEmAndamento = obras.filter((o) => o.status.toLowerCase().includes("andamento")).length
  const obrasConcluidas = obras.filter((o) => o.status.toLowerCase().includes("conclu")).length

  // Calcular evolução média baseada nos dados do backend
  const evolucaoMedia =
    obras.length > 0
      ? Math.round(
          obras.reduce((acc, obra) => {
            const evolucaoNum = Number.parseInt(obra.evolucao.replace("%", "").trim()) || 0
            return acc + evolucaoNum
          }, 0) / obras.length,
        )
      : 0

  // Funções de filtro
  const toggleStatus = (status: string) => {
    setFiltroStatus((current) =>
      current.includes(status) ? current.filter((s) => s !== status) : [...current, status],
    )
  }

  const toggleEtapa = (etapa: string) => {
    setFiltroEtapa((current) => (current.includes(etapa) ? current.filter((e) => e !== etapa) : [...current, etapa]))
  }

  const limparFiltros = () => {
    setFiltroStatus([])
    setFiltroEtapa([])
    setSearchTerm("")
  }

  // Ação: Concluir próxima etapa
  const handleConcluirEtapa = async (obra: ObraListItem) => {
    if (obra.etapa === "N/A") {
      toast({
        title: "Aviso",
        description: "Esta obra não possui etapas definidas",
        variant: "default",
      })
      return
    }

    try {
      const result = await concluirProximaEtapa(obra.id)
      if (result.success) {
        toast({
          title: "Etapa Concluída",
          description: `A próxima etapa da obra "${obra.nome}" foi concluída com sucesso!`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        carregarObras(paginacao.currentPage)
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir etapa",
        variant: "destructive",
      })
    }
  }

  // Ação: Alocar funcionário
  const handleAlocarFuncionario = async () => {
    if (!obraSelecionada || funcionariosSelecionados.length === 0) return

    try {
      // Alocar cada funcionário selecionado
      const result = await alocarFuncionario(obraSelecionada.id, funcionariosSelecionados)

      if (result?.success) {
        const funcionariosNomes = funcionariosSelecionados
          .map((id) => mockData.funcionarios.find((f) => f.id === Number.parseInt(id))?.nome)
          .filter(Boolean)
          .join(", ")

        toast({
          title: "Funcionários Alocados",
          description: `${funcionariosNomes} foram alocados à obra ${obraSelecionada.nome}`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
      }

      if (result?.success === false && result?.message) {
        toast({
          title: "Alguns erros ocorreram",
          description: `funcionário(s) não puderam ser alocados`,
          variant: "destructive",
        })
      }

      carregarObras(paginacao.currentPage)
      setAlocarDialogAberto(false)
      setFuncionariosSelecionados([])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alocar funcionários",
        variant: "destructive",
      })
    }
  }

  // Ação: Linkar orçamento
  const handleLinkarOrcamento = async () => {
    if (!obraSelecionada || orcamentosSelecionados.length === 0) return

    try {
      // Linkar cada orçamento selecionado
      const resultados = await Promise.all(
        orcamentosSelecionados.map((orcamentoId) => linkarOrcamento(obraSelecionada.id, Number.parseInt(orcamentoId))),
      )

      const sucessos = resultados.filter((r) => r.success)
      const erros = resultados.filter((r) => !r.success)

      if (sucessos.length > 0) {
        const orcamentosNumeros = orcamentosSelecionados
          .map((id) => mockData.orcamentos.find((o) => o.id === Number.parseInt(id))?.numero)
          .filter(Boolean)
          .join(", ")

        toast({
          title: "Orçamentos Linkados",
          description: `${orcamentosNumeros} foram linkados à obra ${obraSelecionada.nome}`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
      }

      if (erros.length > 0) {
        toast({
          title: "Alguns erros ocorreram",
          description: `${erros.length} orçamento(s) não puderam ser linkados`,
          variant: "destructive",
        })
      }

      carregarObras(paginacao.currentPage)
      setLinkarDialogAberto(false)
      setOrcamentosSelecionados([])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao linkar orçamentos",
        variant: "destructive",
      })
    }
  }

  // Ação: Excluir obra
  const handleExcluirObra = async (obra: ObraListItem) => {
    if (!confirm(`Tem certeza que deseja excluir a obra "${obra.nome}"?`)) return

    try {
      const result = await excluirObra(obra.id)
      if (result.success) {
        toast({
          title: "Obra Excluída",
          description: `A obra "${obra.nome}" foi excluída com sucesso`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        carregarObras(paginacao.currentPage)
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir obra",
        variant: "destructive",
      })
    }
  }

  // Função para formatar status
  const formatarStatusObra = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes("andamento")) {
      return {
        label: status,
        variant: "default" as const,
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      }
    }

    if (statusLower.includes("conclu")) {
      return {
        label: status,
        variant: "default" as const,
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      }
    }

    if (statusLower.includes("planejamento")) {
      return {
        label: status,
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      }
    }

    return {
      label: status,
      variant: "outline" as const,
      className: "",
    }
  }

  // Navegação de páginas
  const irParaPagina = (page: number) => {
    if (page >= 1 && page <= paginacao.totalPages) {
      carregarObras(page)
    }
  }

  const toggleFuncionario = (funcionarioId: string) => {
    setFuncionariosSelecionados((current) =>
      current.includes(funcionarioId) ? current.filter((id) => id !== funcionarioId) : [...current, funcionarioId],
    )
  }

  const toggleOrcamento = (orcamentoId: string) => {
    setOrcamentosSelecionados((current) =>
      current.includes(orcamentoId) ? current.filter((id) => id !== orcamentoId) : [...current, orcamentoId],
    )
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Obras</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando obras...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Obras</h2>
        <Button asChild>
          <Link href="/dashboard/obras/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Obra
          </Link>
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Obras</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalObras}</div>
            <p className="text-xs text-muted-foreground">obras cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasEmAndamento}</div>
            <p className="text-xs text-muted-foreground">obras ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasConcluidas}</div>
            <p className="text-xs text-muted-foreground">obras finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evolução Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evolucaoMedia}%</div>
            <p className="text-xs text-muted-foreground">progresso geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar obras..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover open={filtroAberto} onOpenChange={setFiltroAberto}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <ScrollArea className="h-96">
              <div className="space-y-4 p-1">
                <h4 className="font-medium">Filtrar por</h4>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Status</h5>
                  <div className="space-y-2">
                    {statusDisponiveis.map((status) => (
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
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Etapa Atual</h5>
                  <div className="space-y-2">
                    {etapasDisponiveis.map((etapa) => (
                      <div key={etapa} className="flex items-center space-x-2">
                        <Checkbox
                          id={`etapa-${etapa}`}
                          checked={filtroEtapa.includes(etapa)}
                          onCheckedChange={() => toggleEtapa(etapa)}
                        />
                        <label
                          htmlFor={`etapa-${etapa}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {etapa}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" size="sm" onClick={limparFiltros}>
                    Limpar Filtros
                  </Button>
                  <Button size="sm" onClick={() => setFiltroAberto(false)}>
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tabela */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Nome</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Etapa Atual</TableHead>
                <TableHead>Evolução</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obrasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma obra encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                obrasFiltradas.map((obra) => {
                  const statusInfo = formatarStatusObra(obra.status)
                  const podeConclurEtapa = obra.etapa !== "N/A" && !obra.status.toLowerCase().includes("conclu")

                  return (
                    <TableRow key={obra.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{obra.nome}</div>
                          <div className="text-sm text-muted-foreground md:hidden">{obra.cliente}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{obra.cliente}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={statusInfo.variant} className={statusInfo.className}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {obra.etapa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{obra.evolucao}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botão de Concluir Etapa */}
                          {podeConclurEtapa && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConcluirEtapa(obra)}
                              className="hidden sm:flex"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Concluir Etapa
                            </Button>
                          )}

                          {/* Menu de Ações */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Ações Rápidas */}
                              {podeConclurEtapa && (
                                <DropdownMenuItem onClick={() => handleConcluirEtapa(obra)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Concluir Próxima Etapa
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setObraSelecionada(obra)
                                  setAlocarDialogAberto(true)
                                }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Alocar Funcionário
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setObraSelecionada(obra)
                                  setLinkarDialogAberto(true)
                                }}
                              >
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Linkar Orçamento
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {/* Ações Padrão */}
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/obras/${obra.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/obras/${obra.id}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
      {paginacao.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {obras.length} de {paginacao.totalItens} obras
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => irParaPagina(paginacao.currentPage - 1)}
              disabled={paginacao.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paginacao.totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={page === paginacao.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => irParaPagina(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => irParaPagina(paginacao.currentPage + 1)}
              disabled={paginacao.currentPage >= paginacao.totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo: Alocar Funcionário */}
      <Dialog open={alocarDialogAberto} onOpenChange={setAlocarDialogAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alocar Funcionários</DialogTitle>
            <DialogDescription>
              Selecione um ou mais funcionários para alocar na obra "{obraSelecionada?.nome}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Funcionários Disponíveis</Label>
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-2">
                  {mockData.funcionarios
                    .filter((f) => f.disponivel)
                    .map((funcionario) => (
                      <div
                        key={funcionario.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => toggleFuncionario(funcionario.id.toString())}
                      >
                        <Checkbox
                          checked={funcionariosSelecionados.includes(funcionario.id.toString())}
                          onCheckedChange={() => toggleFuncionario(funcionario.id.toString())}
                        />
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{funcionario.nome}</div>
                          <div className="text-sm text-muted-foreground">{funcionario.cargo}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              {funcionariosSelecionados.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {funcionariosSelecionados.length} funcionário(s) selecionado(s)
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlocarDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAlocarFuncionario} disabled={funcionariosSelecionados.length === 0}>
              Alocar {funcionariosSelecionados.length > 0 ? `(${funcionariosSelecionados.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Linkar Orçamento */}
      <Dialog open={linkarDialogAberto} onOpenChange={setLinkarDialogAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Linkar Orçamentos</DialogTitle>
            <DialogDescription>
              Selecione um ou mais orçamentos para linkar na obra "{obraSelecionada?.nome}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Orçamentos Aprovados</Label>
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-2">
                  {mockData.orcamentos
                    .filter((o) => o.status === "aprovado")
                    .map((orcamento) => (
                      <div
                        key={orcamento.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => toggleOrcamento(orcamento.id.toString())}
                      >
                        <Checkbox
                          checked={orcamentosSelecionados.includes(orcamento.id.toString())}
                          onCheckedChange={() => toggleOrcamento(orcamento.id.toString())}
                        />
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{orcamento.numero}</div>
                          <div className="text-sm text-muted-foreground">
                            R$ {orcamento.valor.toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              {orcamentosSelecionados.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {orcamentosSelecionados.length} orçamento(s) selecionado(s)
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkarDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLinkarOrcamento} disabled={orcamentosSelecionados.length === 0}>
              Linkar {orcamentosSelecionados.length > 0 ? `(${orcamentosSelecionados.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
