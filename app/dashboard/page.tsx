"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  Star,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/hooks/use-toast"

// Importar as actions e tipos
import {
  getDashboardCompletoAction,
  getDashboardFinanceiroAction,
  getDashboardObrasAction,
  getDashboardFuncionariosAction,
  getDashboardFornecedoresAction,
} from "@/app/actions/dashboard"
import type {
  DashboardData,
  FinanceiroData,
  ObrasData,
  FuncionariosData,
  FornecedoresData,
  DashboardFilters,
} from "@/services/dashboard-service"

// Importar componentes de loading e erro
import { DashboardLoading } from "./components/dashboard-loading"
import { DashboardError } from "./components/dashboard-error"
// Adicionar import do componente de erro de autenticação
import { AuthError } from "./components/auth-error"

// Importar componentes de gráficos
import {
  RevenueChart,
  ExpensesChart,
  ProjectsProgressChart,
  ProjectsStatusChart,
  EmployeesProductivityChart,
  SuppliersDistributionChart,
} from "@/components/charts"

export default function DashboardPage() {
  // Estados para dados
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [financeiroData, setFinanceiroData] = useState<FinanceiroData | null>(null)
  const [obrasData, setObrasData] = useState<ObrasData | null>(null)
  const [funcionariosData, setFuncionariosData] = useState<FuncionariosData | null>(null)
  const [fornecedoresData, setFornecedoresData] = useState<FornecedoresData | null>(null)

  // Estados para controle
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("financeiro")

  // Estados para filtros
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [filtroObras, setFiltroObras] = useState<string[]>([])
  const [filtroDepartamentos, setFiltroDepartamentos] = useState<string[]>([])
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([])
  const [filtroFornecedores, setFiltroFornecedores] = useState<string[]>([])

  // Verificar se é dispositivo móvel
  const isMobile = useMobile()

  // Função para construir filtros
  const buildFilters = useCallback((): DashboardFilters => {
    const filters: DashboardFilters = {}

    if (dateRange?.from) {
      filters.dataInicio = format(dateRange.from, "yyyy-MM-dd")
    }
    if (dateRange?.to) {
      filters.dataFim = format(dateRange.to, "yyyy-MM-dd")
    }
    if (filtroObras.length > 0) {
      filters.obraIds = filtroObras
    }
    if (filtroFornecedores.length > 0) {
      filters.fornecedorIds = filtroFornecedores
    }

    return filters
  }, [dateRange, filtroObras, filtroFornecedores])

  // Função para carregar dados do dashboard completo
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = buildFilters()
      const result = await getDashboardCompletoAction(filters)

      if (result.error) {
        // Verificar se é erro de autenticação
        if (result.error.includes("Token de autenticação") || result.error.includes("não encontrado")) {
          setError("AUTH_ERROR")
        } else {
          setError(result.error)
        }
        toast({
          title: "Erro ao carregar dashboard",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.data) {
        console.log("Dashboard data received:", result.data) // Debug log
        setDashboardData(result.data)
        // Extrair dados específicos para cada seção com verificação de null safety
        setFinanceiroData(result.data.financeiro || null)
        setObrasData(result.data.obras || null)
        setFuncionariosData(result.data.funcionarios || null)
        setFornecedoresData(result.data.fornecedores || null)
      } else {
        setError("Nenhum dado foi retornado do servidor")
      }
    } catch (err) {
      console.error("Dashboard error:", err) // Debug log
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      if (errorMessage.includes("Token de autenticação")) {
        setError("AUTH_ERROR")
      } else {
        setError(errorMessage)
      }
      toast({
        title: "Erro inesperado",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [buildFilters])

  // Função para carregar dados específicos de uma seção
  const loadSectionData = useCallback(
    async (section: string) => {
      try {
        const filters = buildFilters()

        switch (section) {
          case "financeiro":
            const financeiroResult = await getDashboardFinanceiroAction(filters)
            if (financeiroResult.error) {
              toast({
                title: "Erro ao carregar dados financeiros",
                description: financeiroResult.error,
                variant: "destructive",
              })
            } else if (financeiroResult.data) {
              setFinanceiroData(financeiroResult.data)
            }
            break

          case "obras":
            const obrasResult = await getDashboardObrasAction(filters)
            if (obrasResult.error) {
              toast({
                title: "Erro ao carregar dados de obras",
                description: obrasResult.error,
                variant: "destructive",
              })
            } else if (obrasResult.data) {
              setObrasData(obrasResult.data)
            }
            break

          case "funcionarios":
            const funcionariosResult = await getDashboardFuncionariosAction(filters)
            if (funcionariosResult.error) {
              toast({
                title: "Erro ao carregar dados de funcionários",
                description: funcionariosResult.error,
                variant: "destructive",
              })
            } else if (funcionariosResult.data) {
              setFuncionariosData(funcionariosResult.data)
            }
            break

          case "fornecedores":
            const fornecedoresResult = await getDashboardFornecedoresAction(filters)
            if (fornecedoresResult.error) {
              toast({
                title: "Erro ao carregar dados de fornecedores",
                description: fornecedoresResult.error,
                variant: "destructive",
              })
            } else if (fornecedoresResult.data) {
              setFornecedoresData(fornecedoresResult.data)
            }
            break
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
        toast({
          title: "Erro inesperado",
          description: errorMessage,
          variant: "destructive",
        })
      }
    },
    [buildFilters],
  )

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Função para alternar filtro de obras
  const toggleFiltroObra = (obra: string) => {
    setFiltroObras((current) => (current.includes(obra) ? current.filter((o) => o !== obra) : [...current, obra]))
  }

  // Função para alternar filtro de departamentos
  const toggleFiltroDepartamento = (departamento: string) => {
    setFiltroDepartamentos((current) =>
      current.includes(departamento) ? current.filter((d) => d !== departamento) : [...current, departamento],
    )
  }

  // Função para alternar filtro de categorias
  const toggleFiltroCategoria = (categoria: string) => {
    setFiltroCategorias((current) =>
      current.includes(categoria) ? current.filter((c) => c !== categoria) : [...current, categoria],
    )
  }

  // Função para alternar filtro de fornecedores
  const toggleFiltroFornecedor = (fornecedor: string) => {
    setFiltroFornecedores((current) =>
      current.includes(fornecedor) ? current.filter((f) => f !== fornecedor) : [...current, fornecedor],
    )
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setPeriodoSelecionado("mes-atual")
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    })
    setFiltroObras([])
    setFiltroDepartamentos([])
    setFiltroCategorias([])
    setFiltroFornecedores([])
  }

  // Função para atualizar o período com base na seleção
  const atualizarPeriodo = (periodo: string) => {
    setPeriodoSelecionado(periodo)

    const hoje = new Date()

    switch (periodo) {
      case "mes-atual":
        setDateRange({
          from: startOfMonth(hoje),
          to: endOfMonth(hoje),
        })
        break
      case "mes-anterior":
        const mesAnterior = subMonths(hoje, 1)
        setDateRange({
          from: startOfMonth(mesAnterior),
          to: endOfMonth(mesAnterior),
        })
        break
      case "ultimos-3-meses":
        setDateRange({
          from: startOfMonth(subMonths(hoje, 2)),
          to: endOfMonth(hoje),
        })
        break
      case "ultimos-6-meses":
        setDateRange({
          from: startOfMonth(subMonths(hoje, 5)),
          to: endOfMonth(hoje),
        })
        break
      case "ano-atual":
        setDateRange({
          from: new Date(hoje.getFullYear(), 0, 1),
          to: new Date(hoje.getFullYear(), 11, 31),
        })
        break
      case "personalizado":
        // Mantém o dateRange atual para seleção personalizada
        break
    }
  }

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    loadDashboardData()
  }

  // Função para exportar dados
  const exportarDados = () => {
    if (!dashboardData) return

    const dataStr = JSON.stringify(dashboardData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dashboard-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Dados exportados",
      description: "Os dados do dashboard foram exportados com sucesso.",
    })
  }

  // Componente de filtros para desktop e mobile
  const FiltrosComponent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filtrar dados</h4>
      </div>

      <div className="space-y-2">
        <h5 className="text-sm font-medium">Período</h5>
        <Select value={periodoSelecionado} onValueChange={atualizarPeriodo}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes-atual">Mês atual</SelectItem>
            <SelectItem value="mes-anterior">Mês anterior</SelectItem>
            <SelectItem value="ultimos-3-meses">Últimos 3 meses</SelectItem>
            <SelectItem value="ultimos-6-meses">Últimos 6 meses</SelectItem>
            <SelectItem value="ano-atual">Ano atual</SelectItem>
            <SelectItem value="personalizado">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {periodoSelecionado === "personalizado" && (
          <div className="mt-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              locale={ptBR}
              placeholder="Selecione um período"
            />
          </div>
        )}
      </div>

      {obrasData && obrasData.progresso?.progressoPorObra && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Obras</h5>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {obrasData.progresso.progressoPorObra.map((obra) => (
              <div key={obra.obraId} className="flex items-center space-x-2">
                <Checkbox
                  id={`obra-${obra.obraId}`}
                  checked={filtroObras.includes(obra.obraId)}
                  onCheckedChange={() => toggleFiltroObra(obra.obraId)}
                />
                <Label
                  htmlFor={`obra-${obra.obraId}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {obra.nomeObra}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={limparFiltros}>
          Limpar Filtros
        </Button>
        <Button size="sm" onClick={aplicarFiltros}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )

  // Renderização de tabelas responsivas
  const ResponsiveTable = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
      <div className={`w-full overflow-auto ${className}`}>
        <div className="min-w-[600px]">{children}</div>
      </div>
    )
  }


  // Mostrar loading
  if (loading) {
    return <DashboardLoading />
  }

  // Mostrar erro de autenticação
  if (error === "AUTH_ERROR") {
    return <AuthError error="Token de autenticação não encontrado ou expirado" onRetry={loadDashboardData} />
  }

  // Mostrar outros erros
  if (error) {
    return <DashboardError error={error} onRetry={loadDashboardData} />
  }

  // Verificar se temos dados
  if (!dashboardData) {
    return <DashboardError error="Nenhum dado encontrado" onRetry={loadDashboardData} />
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          {/* Filtros para desktop */}
          {!isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <FiltrosComponent />
              </PopoverContent>
            </Popover>
          )}

          {/* Filtros para mobile */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filtros</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:max-w-md">
                <ScrollArea className="h-[calc(100vh-80px)] pr-4">
                  <FiltrosComponent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}

          {/* Botão de exportar */}
          {!isMobile && (
            <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={exportarDados}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}

          {/* Menu para mobile */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <div className="py-4">
                  <h3 className="text-lg font-medium mb-4">Menu</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      size="sm"
                      onClick={exportarDados}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      size="sm"
                      onClick={loadDashboardData}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Visão Geral - KPIs Principais */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Financeiro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              R${" "}
              {isMobile
                ? ((dashboardData.resumoGeral?.saldoFinanceiroAtual || 0) / 1000).toFixed(0) + "K"
                : (dashboardData.resumoGeral?.saldoFinanceiroAtual || 0).toLocaleString("pt-BR")}
            </div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                Total investido: R$ {(dashboardData.resumoGeral?.totalInvestido || 0).toLocaleString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.resumoGeral?.obrasEmAndamento || 0}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                {dashboardData.resumoGeral?.obrasEmAtraso || 0} com atraso (
                {(dashboardData.resumoGeral?.percentualAtraso || 0).toFixed(1)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.resumoGeral?.totalFuncionarios || 0}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                {dashboardData.resumoGeral?.funcionariosAtivos || 0} ativos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {(dashboardData.resumoGeral?.progressoMedioObras || 0).toFixed(1)}%
            </div>
            <div className="flex items-center pt-1">
              <Progress value={dashboardData.resumoGeral?.progressoMedioObras || 0} className="h-2 w-16 mr-2" />
              <span className="text-xs text-muted-foreground">das obras</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(dashboardData.alertas?.obrasComAtraso?.length > 0 ||
        dashboardData.alertas?.fornecedoresInativos?.length > 0 ||
        dashboardData.alertas?.funcionariosSemApontamento?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas
            </CardTitle>
            <CardDescription>Itens que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {dashboardData.alertas?.obrasComAtraso?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Obras com Atraso</h4>
                  <div className="space-y-1">
                    {dashboardData.alertas.obrasComAtraso.map((obra, index) => (
                      <Badge key={`obra-atraso-${index}`} variant="destructive" className="text-xs">
                        {obra}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {dashboardData.alertas?.fornecedoresInativos?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Fornecedores Inativos</h4>
                  <div className="space-y-1">
                    {dashboardData.alertas.fornecedoresInativos.map((fornecedor, index) => (
                      <Badge key={`fornecedor-inativo-${index}`} variant="secondary" className="text-xs">
                        {fornecedor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {dashboardData.alertas?.funcionariosSemApontamento?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Funcionários sem Apontamento</h4>
                  <div className="space-y-1">
                    {dashboardData.alertas.funcionariosSemApontamento.map((funcionario, index) => (
                      <Badge key={`funcionario-sem-apontamento-${index}`} variant="outline" className="text-xs">
                        {funcionario}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {((dashboardData.alertas?.orcamentosPendentes || 0) > 0 || (dashboardData.alertas?.pagamentosPendentes || 0) > 0) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  {(dashboardData.alertas?.orcamentosPendentes || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{dashboardData.alertas.orcamentosPendentes} orçamentos pendentes</span>
                    </div>
                  )}
                  {(dashboardData.alertas?.pagamentosPendentes || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{dashboardData.alertas.pagamentosPendentes} pagamentos pendentes</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs para categorias de análise */}
      {isMobile ? (
        <div className="space-y-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="obras">Obras</SelectItem>
              <SelectItem value="funcionarios">Funcionários</SelectItem>
              <SelectItem value="fornecedores">Fornecedores</SelectItem>
            </SelectContent>
          </Select>

          {/* Conteúdo das tabs para mobile */}
          {activeTab === "financeiro" && financeiroData && (
            <div className="space-y-4">
              {/* Fluxo de Caixa */}
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                  <CardDescription>
                    Saldo atual: R$ {financeiroData.fluxoCaixa.saldoAtual.toLocaleString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={financeiroData} height={200} />
                </CardContent>
              </Card>

              {/* Distribuição de Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                  <CardDescription>
                    Total: R$ {financeiroData.distribuicaoDespesas.totalGasto.toLocaleString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensesChart data={financeiroData} height={200} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "obras" && obrasData && (
            <div className="space-y-4">
              {/* Progresso das Obras */}
              <Card>
                <CardHeader>
                  <CardTitle>Progresso das Obras</CardTitle>
                  <CardDescription>{obrasData.progresso.obrasEmAndamento} obras em andamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {obrasData.progresso?.progressoPorObra
                      ?.filter((obra) => obra.status === "Em Andamento")
                      ?.slice(0, 5)
                      ?.map((obra) => (
                        <div key={obra.obraId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{obra.nomeObra}</span>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {obra.etapasConcluidas}/{obra.etapasTotal} etapas
                                </Badge>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{obra.percentualConcluido}%</span>
                          </div>
                          <Progress value={obra.percentualConcluido} className="h-2" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>Total de {obrasData.distribuicao.totalObras} obras</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectsStatusChart data={obrasData} height={200} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "funcionarios" && funcionariosData && (
            <div className="space-y-4">
              {/* Top Funcionários */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Funcionários</CardTitle>
                  <CardDescription>Melhores avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funcionariosData.topFuncionarios?.top5Funcionarios?.map((funcionario, index) => (
                      <div key={`funcionario-mobile-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {funcionario.nomeFuncionario
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{funcionario.nomeFuncionario}</p>
                            <p className="text-xs text-muted-foreground">{funcionario.cargo}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{funcionario.notaAvaliacao}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(funcionario.notaAvaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Produtividade */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtividade</CardTitle>
                  <CardDescription>
                    Média geral: {funcionariosData.produtividade.mediaGeralProdutividade.toFixed(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeesProductivityChart data={funcionariosData} height={200} chartType="line" />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "fornecedores" && fornecedoresData && (
            <div className="space-y-4">
              {/* Top Fornecedores */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Fornecedores</CardTitle>
                  <CardDescription>
                    Avaliação média: {fornecedoresData.topFornecedores.avaliacaoMedia.toFixed(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fornecedoresData.topFornecedores?.top5Fornecedores?.map((fornecedor, index) => (
                      <div key={`fornecedor-mobile-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{fornecedor.nomeFornecedor}</p>
                            <p className="text-xs text-muted-foreground">{fornecedor.cnpj}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{fornecedor.avaliacao}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(fornecedor.avaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>
                    {fornecedoresData.fornecedoresPorCategoria.totalFornecedores} fornecedores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SuppliersDistributionChart data={fornecedoresData} height={200} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="obras">Obras</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          </TabsList>

          {/* Análise Financeira */}
          <TabsContent value="financeiro" className="space-y-4">
            {financeiroData ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Fluxo de Caixa</CardTitle>
                      <CardDescription>Tendência: {financeiroData.fluxoCaixa.tendenciaMensal}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <RevenueChart data={financeiroData} />
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Distribuição de Despesas</CardTitle>
                      <CardDescription>
                        Maior categoria: {financeiroData.distribuicaoDespesas.maiorCategoria}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExpensesChart data={financeiroData} />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento de Despesas</CardTitle>
                    <CardDescription>
                      Total gasto: R$ {financeiroData.distribuicaoDespesas.totalGasto.toLocaleString("pt-BR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveTable>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Valor (R$)</TableHead>
                            <TableHead>Porcentagem</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Distribuição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {financeiroData.distribuicaoDespesas?.distribuicao?.map((item) => (
                            <TableRow key={item.categoria}>
                              <TableCell className="font-medium">{item.categoria}</TableCell>
                              <TableCell>{item.valor.toLocaleString("pt-BR")}</TableCell>
                              <TableCell>{item.percentual.toFixed(1)}%</TableCell>
                              <TableCell>{item.quantidadeItens}</TableCell>
                              <TableCell>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${item.percentual}%` }}
                                  ></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ResponsiveTable>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados financeiros...</p>
              </div>
            )}
          </TabsContent>

          {/* Análise de Obras */}
          <TabsContent value="obras" className="space-y-4">
            {obrasData ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Progresso das Obras</CardTitle>
                      <CardDescription>
                        Progresso médio: {obrasData.progresso.progressoMedio.toFixed(1)}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProjectsProgressChart data={obrasData} />
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Distribuição por Status</CardTitle>
                      <CardDescription>Status mais comum: {obrasData.distribuicao.statusMaisComum}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProjectsStatusChart data={obrasData} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tendências</CardTitle>
                      <CardDescription>Tendência geral: {obrasData.tendencias.tendenciaGeral}</CardDescription>
                    </CardHeader>
                    <CardContent>
                   
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{obrasData.tendencias.obrasNoPrazo}</div>
                          <div className="text-sm text-muted-foreground">No prazo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{obrasData.tendencias.obrasEmAtraso}</div>
                          <div className="text-sm text-muted-foreground">Em atraso</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo Geral</CardTitle>
                      <CardDescription>Estatísticas das obras</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{obrasData.progresso.totalObras}</div>
                            <div className="text-sm text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{obrasData.progresso.obrasConcluidas}</div>
                            <div className="text-sm text-muted-foreground">Concluídas</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Percentual de atraso</span>
                            <span className="text-sm font-medium">
                              {obrasData.tendencias.percentualAtraso.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={obrasData.tendencias.percentualAtraso} className="h-2" />
                        </div>
                        <div className="text-center pt-2">
                          <div className="text-lg font-medium">{obrasData.tendencias.previsaoConclusaoMes}</div>
                          <div className="text-sm text-muted-foreground">Previsão de conclusão este mês</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados de obras...</p>
              </div>
            )}
          </TabsContent>

          {/* Análise de Funcionários */}
          <TabsContent value="funcionarios" className="space-y-4">
            {funcionariosData ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Top Funcionários</CardTitle>
                      <CardDescription>Critério: {funcionariosData.topFuncionarios.criterioAvaliacao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {funcionariosData.topFuncionarios?.top5Funcionarios?.map((funcionario, index) => (
                          <div key={`funcionario-desktop-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                {index + 1}
                              </div>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {funcionario.nomeFuncionario
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{funcionario.nomeFuncionario}</p>
                                <p className="text-xs text-muted-foreground">{funcionario.cargo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {funcionario.obrasParticipadas} obras participadas
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center mb-1">
                                <span className="text-sm font-medium mr-2">{funcionario.notaAvaliacao}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < Math.floor(funcionario.notaAvaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {funcionario.avaliacaoDesempenho}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Produtividade</CardTitle>
                      <CardDescription>
                        Média geral: {funcionariosData.produtividade.mediaGeralProdutividade.toFixed(1)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EmployeesProductivityChart data={funcionariosData} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Custos de Mão de Obra</CardTitle>
                      <CardDescription>
                        Custo total: R$ {funcionariosData.custosMaoObra.custoTotalMaoObra.toLocaleString("pt-BR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold">
                              R$ {funcionariosData.custosMaoObra.custoMedioFuncionario.toLocaleString("pt-BR")}
                            </div>
                            <div className="text-sm text-muted-foreground">Custo médio/funcionário</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">
                              R$ {funcionariosData.custosMaoObra.custoMedioObra.toLocaleString("pt-BR")}
                            </div>
                            <div className="text-sm text-muted-foreground">Custo médio/obra</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Top 5 Custos por Funcionário</h4>
                          {funcionariosData.custosMaoObra?.custosPorFuncionario?.slice(0, 5)?.map((funcionario, index) => (
                            <div key={`funcionario-custo-${index}`} className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium">{funcionario.nomeFuncionario}</span>
                                <span className="text-xs text-muted-foreground ml-2">({funcionario.cargo})</span>
                              </div>
                              <span className="text-sm">R$ {funcionario.custoTotal.toLocaleString("pt-BR")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Produtividade por Funcionário</CardTitle>
                      <CardDescription>Top 5 mais produtivos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {funcionariosData.produtividade?.top5Produtivos?.map((funcionario, index) => (
                          <div key={`funcionario-produtividade-${index}`} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <span className="text-sm font-medium">{funcionario.nomeFuncionario}</span>
                                  <div className="text-xs text-muted-foreground">
                                    {funcionario.cargo} • {funcionario.obrasAlocadas} obras
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm font-medium">{funcionario.indiceProdutividade.toFixed(1)}%</span>
                            </div>
                            <Progress value={funcionario.indiceProdutividade} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados de funcionários...</p>
              </div>
            )}
          </TabsContent>

          {/* Análise de Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-4">
            {fornecedoresData ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Top Fornecedores</CardTitle>
                      <CardDescription>Critério: {fornecedoresData.topFornecedores.criterioAvaliacao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveTable>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fornecedor</TableHead>
                              <TableHead>Avaliação</TableHead>
                              <TableHead>Orçamentos</TableHead>
                              <TableHead>Valor Total</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fornecedoresData.topFornecedores?.top5Fornecedores?.map((fornecedor, index) => (
                              <TableRow key={`fornecedor-table-${index}`}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{fornecedor.nomeFornecedor}</div>
                                    <div className="text-xs text-muted-foreground">{fornecedor.cnpj}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium mr-2">{fornecedor.avaliacao}</span>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${i < Math.floor(fornecedor.avaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{fornecedor.totalOrcamentos}</TableCell>
                                <TableCell>R$ {fornecedor.valorTotalGasto.toLocaleString("pt-BR")}</TableCell>
                                <TableCell>
                                  <Badge variant={fornecedor.status === "Ativo" ? "default" : "secondary"}>
                                    {fornecedor.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ResponsiveTable>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Distribuição por Categoria</CardTitle>
                      <CardDescription>
                        Mais popular: {fornecedoresData.fornecedoresPorCategoria.categoriaMaisPopular}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SuppliersDistributionChart data={fornecedoresData} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gastos por Fornecedor</CardTitle>
                      <CardDescription>
                        Total gasto: R${" "}
                        {fornecedoresData.gastosFornecedores.totalGastoFornecedores.toLocaleString("pt-BR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">
                            R$ {fornecedoresData.gastosFornecedores.gastoMedioFornecedor.toLocaleString("pt-BR")}
                          </div>
                          <div className="text-sm text-muted-foreground">Gasto médio por fornecedor</div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Top 5 Gastos</h4>
                          {fornecedoresData.gastosFornecedores?.top10Gastos?.slice(0, 5)?.map((fornecedor, index) => (
                            <div key={`fornecedor-gastos-${index}`} className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium">{fornecedor.nomeFornecedor}</span>
                                <div className="text-xs text-muted-foreground">
                                  {fornecedor.quantidadeOrcamentos} orçamentos • Ticket médio: R${" "}
                                  {fornecedor.ticketMedio.toLocaleString("pt-BR")}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  R$ {fornecedor.valorTotalGasto.toLocaleString("pt-BR")}
                                </div>
                                <div className="text-xs text-muted-foreground">{fornecedor.percentual.toFixed(1)}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas Gerais</CardTitle>
                      <CardDescription>Resumo dos fornecedores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {fornecedoresData.estatisticasGerais.totalFornecedores}
                            </div>
                            <div className="text-sm text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {fornecedoresData.estatisticasGerais.fornecedoresAtivos}
                            </div>
                            <div className="text-sm text-muted-foreground">Ativos</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Avaliação média geral</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">
                                {fornecedoresData.estatisticasGerais.avaliacaoMediaGeral.toFixed(1)}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(fornecedoresData.estatisticasGerais.avaliacaoMediaGeral) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={fornecedoresData.estatisticasGerais.avaliacaoMediaGeral * 20}
                            className="h-2"
                          />
                        </div>

                        <div className="text-center pt-2">
                          <div className="text-lg font-medium">
                            {fornecedoresData.estatisticasGerais.tempoMedioContrato}
                          </div>
                          <div className="text-sm text-muted-foreground">Tempo médio de contrato (dias)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados de fornecedores...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Informações de atualização */}
      {dashboardData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Última atualização: {new Date(dashboardData.ultimaAtualizacao).toLocaleString("pt-BR")}</span>
              <span>Versão do cache: {dashboardData.versaoCache}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
