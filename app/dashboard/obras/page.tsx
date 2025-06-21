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
  Trash2,
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
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Actions e utilitários
import {
  listarObras,
  excluirObra,
  concluirEtapa,
  alocarFuncionario,
  linkarOrcamento,
  type Obra,
} from "@/app/actions/obra"
import {
  calcularEvolucao,
  obterEtapaAtual,
  getProgressColor, // Renomeado para consistência
  obterProximaEtapa,
  formatarStatusObra, // Adicionado de volta
} from "@/app/lib/obra-utils"

// Dados mockados para seleções rápidas
const funcionariosDisponiveis = [
  { id: 1, nome: "João Silva", cargo: "Pedreiro" },
  { id: 2, nome: "Maria Oliveira", cargo: "Engenheira Civil" },
  { id: 3, nome: "Carlos Santos", cargo: "Eletricista" },
  { id: 4, nome: "Ana Pereira", cargo: "Arquiteta" },
  { id: 5, nome: "Pedro Souza", cargo: "Mestre de Obras" },
]

const orcamentosDisponiveis = [
  { id: 1, numero: "ORC-2024-001", valor: 125000 },
  { id: 2, numero: "ORC-2024-002", valor: 85000 },
  { id: 3, numero: "ORC-2024-003", valor: 200000 },
  { id: 4, numero: "ORC-2024-004", valor: 150000 },
  { id: 5, numero: "ORC-2024-005", valor: 95000 },
]

export default function ObrasPage() {
  // Estados
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [filtroResponsavel, setFiltroResponsavel] = useState<string[]>([])
  const [filtroEtapa, setFiltroEtapa] = useState<string[]>([])

  // Estados para diálogos de ações rápidas
  const [alocarDialogAberto, setAlocarDialogAberto] = useState(false)
  const [linkarDialogAberto, setLinkarDialogAberto] = useState(false)
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null)
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("")
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState("")

  // Carregar obras
  useEffect(() => {
    carregarObras()
  }, [])

  const carregarObras = async () => {
    setLoading(true)
    try {
      const result = await listarObras()
      if (result.success) {
        setObras(result.data)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as obras",
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

  // Obter responsáveis únicos
  const responsaveis = Array.from(new Set(obras.map((obra) => obra.responsavel))).sort()

  // Etapas disponíveis para filtro
  const etapasDisponiveis = ["Fundações", "Estrutura", "Alvenaria", "Instalações", "Acabamentos"]

  // Filtrar obras
  const filtrarObras = () => {
    return obras.filter((obra) => {
      const matchesSearch =
        obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.endereco.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filtroStatus.length === 0 || filtroStatus.includes(obra.status)
      const matchesResponsavel = filtroResponsavel.length === 0 || filtroResponsavel.includes(obra.responsavel)

      const etapaAtual = obterEtapaAtual(obra.etapas)
      const matchesEtapa = filtroEtapa.length === 0 || filtroEtapa.includes(etapaAtual)

      return matchesSearch && matchesStatus && matchesResponsavel && matchesEtapa
    })
  }

  const obrasFiltradas = filtrarObras()

  // Calcular estatísticas
  const totalObras = obras.length
  const obrasEmAndamento = obras.filter((o) => o.status === "Em andamento").length
  const obrasConcluidas = obras.filter((o) => o.status === "Concluída").length
  const evolucaoMedia =
    obras.length > 0
      ? Math.round(obras.reduce((acc, obra) => acc + calcularEvolucao(obra.etapas), 0) / obras.length)
      : 0

  // Funções de filtro
  const toggleStatus = (status: string) => {
    setFiltroStatus((current) =>
      current.includes(status) ? current.filter((s) => s !== status) : [...current, status],
    )
  }

  const toggleResponsavel = (responsavel: string) => {
    setFiltroResponsavel((current) =>
      current.includes(responsavel) ? current.filter((r) => r !== responsavel) : [...current, responsavel],
    )
  }

  const toggleEtapa = (etapa: string) => {
    setFiltroEtapa((current) => (current.includes(etapa) ? current.filter((e) => e !== etapa) : [...current, etapa]))
  }

  const limparFiltros = () => {
    setFiltroStatus([])
    setFiltroResponsavel([])
    setFiltroEtapa([])
    setSearchTerm("")
  }

  // Ação: Concluir próxima etapa
  const handleConcluirEtapa = async (obra: Obra) => {
    const proximaEtapa = obterProximaEtapa(obra.etapas)
    if (!proximaEtapa) {
      toast({
        title: "Aviso",
        description: "Todas as etapas já foram concluídas",
        variant: "default",
      })
      return
    }

    try {
      const result = await concluirEtapa(obra.id, proximaEtapa.id)
      if (result.success) {
        toast({
          title: "Etapa Concluída",
          description: `A etapa "${proximaEtapa.nome}" foi concluída com sucesso!`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        carregarObras()
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
    if (!obraSelecionada || !funcionarioSelecionado) return

    try {
      const result = await alocarFuncionario(obraSelecionada.id, Number.parseInt(funcionarioSelecionado))
      if (result.success) {
        const funcionario = funcionariosDisponiveis.find((f) => f.id === Number.parseInt(funcionarioSelecionado))
        toast({
          title: "Funcionário Alocado",
          description: `${funcionario?.nome} foi alocado à obra ${obraSelecionada.nome}`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        carregarObras()
        setAlocarDialogAberto(false)
        setFuncionarioSelecionado("")
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
        description: "Erro ao alocar funcionário",
        variant: "destructive",
      })
    }
  }

  // Ação: Linkar orçamento
  const handleLinkarOrcamento = async () => {
    if (!obraSelecionada || !orcamentoSelecionado) return

    try {
      const result = await linkarOrcamento(obraSelecionada.id, Number.parseInt(orcamentoSelecionado))
      if (result.success) {
        const orcamento = orcamentosDisponiveis.find((o) => o.id === Number.parseInt(orcamentoSelecionado))
        toast({
          title: "Orçamento Linkado",
          description: `Orçamento ${orcamento?.numero} foi linkado à obra ${obraSelecionada.nome}`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        carregarObras()
        setLinkarDialogAberto(false)
        setOrcamentoSelecionado("")
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
        description: "Erro ao linkar orçamento",
        variant: "destructive",
      })
    }
  }

  // Ação: Excluir obra
  const handleExcluirObra = async (obra: Obra) => {
    if (!confirm(`Tem certeza que deseja excluir a obra "${obra.nome}"?`)) return

    try {
      const result = await excluirObra(obra.id)
      if (result.success) {
        toast({
          title: "Obra Excluída",
          description: `A obra "${obra.nome}" foi excluída com sucesso`,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
        carregarObras()
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
            <Button variant="outline" className="w-full sm:w-auto">
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
                    {["Concluída", "Em andamento", "Pausada"].map((status) => (
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
                  <h5 className="text-sm font-medium">Responsável</h5>
                  <div className="space-y-2">
                    {responsaveis.map((responsavel) => (
                      <div key={responsavel} className="flex items-center space-x-2">
                        <Checkbox
                          id={`responsavel-${responsavel}`}
                          checked={filtroResponsavel.includes(responsavel)}
                          onCheckedChange={() => toggleResponsavel(responsavel)}
                        />
                        <label
                          htmlFor={`responsavel-${responsavel}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {responsavel}
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
                <TableHead className="hidden lg:table-cell">Endereço</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Etapa Atual</TableHead>
                <TableHead>Evolução</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obrasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhuma obra encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                obrasFiltradas.map((obra) => {
                  const evolucao = calcularEvolucao(obra.etapas)
                  const etapaAtual = obterEtapaAtual(obra.etapas)
                  const proximaEtapa = obterProximaEtapa(obra.etapas)
                  const statusInfo = formatarStatusObra(obra.status)

                  return (
                    <TableRow key={obra.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{obra.nome}</div>
                          <div className="text-sm text-muted-foreground md:hidden">{obra.cliente}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{obra.cliente}</TableCell>
                      <TableCell className="hidden lg:table-cell">{obra.endereco}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={statusInfo.variant} className={statusInfo.className}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {etapaAtual}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[80px]">
                            <Progress value={evolucao} className={getProgressColor(evolucao)} />
                          </div>
                          <span className="text-sm font-medium min-w-[35px]">{evolucao}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botão de Concluir Etapa */}
                          {proximaEtapa && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConcluirEtapa(obra)}
                              className="hidden sm:flex"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Concluir {proximaEtapa.nome}
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
                              {proximaEtapa && (
                                <DropdownMenuItem onClick={() => handleConcluirEtapa(obra)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Concluir {proximaEtapa.nome}
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
                              <DropdownMenuItem className="text-destructive" onClick={() => handleExcluirObra(obra)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
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

      {/* Diálogo: Alocar Funcionário */}
      <Dialog open={alocarDialogAberto} onOpenChange={setAlocarDialogAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alocar Funcionário</DialogTitle>
            <DialogDescription>
              Selecione um funcionário para alocar na obra "{obraSelecionada?.nome}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="funcionario">Funcionário</Label>
              <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {funcionariosDisponiveis.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{funcionario.nome}</div>
                          <div className="text-sm text-muted-foreground">{funcionario.cargo}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlocarDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAlocarFuncionario}>Alocar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Linkar Orçamento */}
      <Dialog open={linkarDialogAberto} onOpenChange={setLinkarDialogAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Linkar Orçamento</DialogTitle>
            <DialogDescription>Selecione um orçamento para linkar na obra "{obraSelecionada?.nome}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="orcamento">Orçamento</Label>
              <Select value={orcamentoSelecionado} onValueChange={setOrcamentoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um orçamento" />
                </SelectTrigger>
                <SelectContent>
                  {orcamentosDisponiveis.map((orcamento) => (
                    <SelectItem key={orcamento.id} value={orcamento.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{orcamento.numero}</div>
                          <div className="text-sm text-muted-foreground">Valor: {orcamento.valor}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkarDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLinkarOrcamento}>Linkar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
