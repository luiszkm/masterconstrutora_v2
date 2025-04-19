"use client"

import type React from "react"

import { useState } from "react"
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
  ArrowUpRight,
  ArrowDownRight,
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
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { useMobile } from "@/hooks/use-mobile"

// Dados de exemplo para o dashboard
const dadosFinanceiros = {
  receitas: {
    atual: 1250000,
    anterior: 980000,
    variacao: 27.55,
  },
  despesas: {
    atual: 875000,
    anterior: 720000,
    variacao: 21.53,
  },
  lucro: {
    atual: 375000,
    anterior: 260000,
    variacao: 44.23,
  },
  fluxoCaixa: [
    { mes: "Jan", receitas: 780000, despesas: 650000 },
    { mes: "Fev", receitas: 820000, despesas: 680000 },
    { mes: "Mar", receitas: 900000, despesas: 720000 },
    { mes: "Abr", receitas: 950000, despesas: 750000 },
    { mes: "Mai", receitas: 980000, despesas: 720000 },
    { mes: "Jun", receitas: 1050000, despesas: 780000 },
    { mes: "Jul", receitas: 1100000, despesas: 820000 },
    { mes: "Ago", receitas: 1150000, despesas: 850000 },
    { mes: "Set", receitas: 1200000, despesas: 870000 },
    { mes: "Out", receitas: 1250000, despesas: 875000 },
    { mes: "Nov", receitas: 0, despesas: 0 },
    { mes: "Dez", receitas: 0, despesas: 0 },
  ],
  distribuicaoDespesas: [
    { categoria: "Materiais", valor: 420000, porcentagem: 48 },
    { categoria: "Mão de obra", valor: 280000, porcentagem: 32 },
    { categoria: "Administrativo", valor: 87500, porcentagem: 10 },
    { categoria: "Equipamentos", valor: 52500, porcentagem: 6 },
    { categoria: "Outros", valor: 35000, porcentagem: 4 },
  ],
  orcamentos: {
    total: 18,
    aprovados: 12,
    pendentes: 4,
    rejeitados: 2,
  },
  pagamentos: {
    emDia: 92,
    atrasados: 8,
  },
}

const dadosObras = {
  total: 8,
  concluidas: 3,
  emAndamento: 5,
  atrasadas: 2,
  obras: [
    {
      nome: "Mansão Alphaville",
      progresso: 75,
      status: "Em andamento",
      prazo: "No prazo",
      orcamento: "Dentro do orçamento",
    },
    {
      nome: "Residência Beira-Mar",
      progresso: 45,
      status: "Em andamento",
      prazo: "Atrasada",
      orcamento: "Acima do orçamento",
    },
    {
      nome: "Cobertura Duplex",
      progresso: 90,
      status: "Em andamento",
      prazo: "No prazo",
      orcamento: "Dentro do orçamento",
    },
    {
      nome: "Refúgio na Serra",
      progresso: 20,
      status: "Em andamento",
      prazo: "Atrasada",
      orcamento: "Dentro do orçamento",
    },
    {
      nome: "Mansão Neoclássica",
      progresso: 60,
      status: "Em andamento",
      prazo: "No prazo",
      orcamento: "Dentro do orçamento",
    },
    {
      nome: "Edifício Residencial Aurora",
      progresso: 100,
      status: "Concluída",
      prazo: "No prazo",
      orcamento: "Dentro do orçamento",
    },
    {
      nome: "Condomínio Jardim das Flores",
      progresso: 100,
      status: "Concluída",
      prazo: "Atrasada",
      orcamento: "Dentro do orçamento",
    },
    {
      nome: "Reforma Comercial Centro",
      progresso: 100,
      status: "Concluída",
      prazo: "No prazo",
      orcamento: "Abaixo do orçamento",
    },
  ],
  distribuicaoPorTipo: [
    { tipo: "Residencial", quantidade: 5, porcentagem: 62.5 },
    { tipo: "Comercial", quantidade: 2, porcentagem: 25 },
    { tipo: "Reforma", quantidade: 1, porcentagem: 12.5 },
  ],
  tendenciaPrazos: [
    { mes: "Mai", noPrazo: 5, atrasadas: 1 },
    { mes: "Jun", noPrazo: 4, atrasadas: 2 },
    { mes: "Jul", noPrazo: 5, atrasadas: 1 },
    { mes: "Ago", noPrazo: 4, atrasadas: 2 },
    { mes: "Set", noPrazo: 5, atrasadas: 2 },
    { mes: "Out", noPrazo: 6, atrasadas: 2 },
  ],
}

const dadosFuncionarios = {
  total: 24,
  ativos: 22,
  afastados: 2,
  distribuicaoPorDepartamento: [
    { departamento: "Construção", quantidade: 14, porcentagem: 58.3 },
    { departamento: "Projetos", quantidade: 4, porcentagem: 16.7 },
    { departamento: "Administração", quantidade: 3, porcentagem: 12.5 },
    { departamento: "Design", quantidade: 2, porcentagem: 8.3 },
    { departamento: "Segurança", quantidade: 1, porcentagem: 4.2 },
  ],
  custoMensal: 125000,
  produtividade: [
    { mes: "Mai", indice: 85 },
    { mes: "Jun", indice: 82 },
    { mes: "Jul", indice: 88 },
    { mes: "Ago", indice: 90 },
    { mes: "Set", indice: 87 },
    { mes: "Out", indice: 92 },
  ],
  topFuncionarios: [
    { nome: "Maria Oliveira", cargo: "Engenheira Civil", avaliacao: 4.9, avatar: "/confident-executive.png" },
    { nome: "João Silva", cargo: "Pedreiro", avaliacao: 4.8, avatar: "/confident-leader.png" },
    { nome: "Ana Pereira", cargo: "Arquiteta", avaliacao: 4.7, avatar: null },
    { nome: "Carlos Santos", cargo: "Eletricista", avaliacao: 4.5, avatar: null },
    { nome: "Pedro Souza", cargo: "Mestre de Obras", avaliacao: 4.4, avatar: null },
  ],
}

const dadosMateriais = {
  total: 120,
  emEstoque: 98,
  baixoEstoque: 15,
  semEstoque: 7,
  valorTotal: 350000,
  consumoMensal: [
    { mes: "Mai", valor: 85000 },
    { mes: "Jun", valor: 92000 },
    { mes: "Jul", valor: 78000 },
    { mes: "Ago", valor: 88000 },
    { mes: "Set", valor: 95000 },
    { mes: "Out", valor: 105000 },
  ],
  distribuicaoPorCategoria: [
    { categoria: "Cimento e Concreto", valor: 105000, porcentagem: 30 },
    { categoria: "Aço e Metais", valor: 87500, porcentagem: 25 },
    { categoria: "Acabamentos", valor: 70000, porcentagem: 20 },
    { categoria: "Elétrica", valor: 35000, porcentagem: 10 },
    { categoria: "Hidráulica", valor: 35000, porcentagem: 10 },
    { categoria: "Outros", valor: 17500, porcentagem: 5 },
  ],
  materiaisCriticos: [
    { nome: "Cimento Portland CP II", estoque: 5, unidade: "Saco 50kg", status: "Crítico" },
    { nome: "Vergalhão CA-50 10mm", estoque: 8, unidade: "Barra 12m", status: "Baixo" },
    { nome: "Tijolo Cerâmico 9x19x19", estoque: 3, unidade: "Milheiro", status: "Crítico" },
    { nome: "Mármore Carrara", estoque: 4, unidade: "m²", status: "Baixo" },
    { nome: "Cabo Flexível 2,5mm²", estoque: 7, unidade: "Rolo 100m", status: "Baixo" },
  ],
}

const dadosFornecedores = {
  total: 36,
  ativos: 28,
  inativos: 8,
  avaliacaoMedia: 4.2,
  distribuicaoPorTipo: [
    { tipo: "Materiais de Construção", quantidade: 12, porcentagem: 33.3 },
    { tipo: "Acabamentos", quantidade: 8, porcentagem: 22.2 },
    { tipo: "Elétrica", quantidade: 5, porcentagem: 13.9 },
    { tipo: "Hidráulica", quantidade: 5, porcentagem: 13.9 },
    { tipo: "Ferramentas", quantidade: 4, porcentagem: 11.1 },
    { tipo: "Outros", quantidade: 2, porcentagem: 5.6 },
  ],
  topFornecedores: [
    { nome: "Materiais Premium Ltda", tipo: "Materiais de Construção", avaliacao: 4.8, pontualidade: 95 },
    { nome: "Mármores & Granitos SA", tipo: "Acabamentos", avaliacao: 4.7, pontualidade: 92 },
    { nome: "Elétrica Total", tipo: "Elétrica", avaliacao: 4.6, pontualidade: 90 },
    { nome: "Hidráulica Express", tipo: "Hidráulica", avaliacao: 4.5, pontualidade: 88 },
    { nome: "Madeiras Nobres", tipo: "Materiais de Construção", avaliacao: 4.4, pontualidade: 85 },
  ],
  comparativoPrecos: [
    { material: "Cimento Portland CP II", melhorPreco: "Materiais Premium Ltda", economiaPercentual: 12 },
    { material: "Tijolo Cerâmico 9x19x19", melhorPreco: "Constrular Materiais", economiaPercentual: 8 },
    { material: "Vergalhão CA-50 10mm", melhorPreco: "Aço & Ferro Distribuidor", economiaPercentual: 15 },
    { material: "Piso Porcelanato 60x60", melhorPreco: "Mármores & Granitos SA", economiaPercentual: 10 },
    { material: "Cabo Flexível 2,5mm²", melhorPreco: "Elétrica Total", economiaPercentual: 7 },
  ],
}

export default function DashboardPage() {
  // Estado para filtros
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [filtroObras, setFiltroObras] = useState<string[]>([])
  const [filtroDepartamentos, setFiltroDepartamentos] = useState<string[]>([])
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([])
  const [filtroFornecedores, setFiltroFornecedores] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("financeiro")

  // Verificar se é dispositivo móvel
  const isMobile = useMobile()

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

  // Componente de filtros para desktop e mobile
  const FiltrosComponent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filtrar dados</h4>
        {isMobile && <ThemeToggle />}
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

      <div className="space-y-2">
        <h5 className="text-sm font-medium">Obras</h5>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {dadosObras.obras.map((obra) => (
            <div key={obra.nome} className="flex items-center space-x-2">
              <Checkbox
                id={`obra-${obra.nome}`}
                checked={filtroObras.includes(obra.nome)}
                onCheckedChange={() => toggleFiltroObra(obra.nome)}
              />
              <Label
                htmlFor={`obra-${obra.nome}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {obra.nome}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-sm font-medium">Departamentos</h5>
        <div className="space-y-2">
          {dadosFuncionarios.distribuicaoPorDepartamento.map((dept) => (
            <div key={dept.departamento} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${dept.departamento}`}
                checked={filtroDepartamentos.includes(dept.departamento)}
                onCheckedChange={() => toggleFiltroDepartamento(dept.departamento)}
              />
              <Label
                htmlFor={`dept-${dept.departamento}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dept.departamento}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-sm font-medium">Categorias de Materiais</h5>
        <div className="space-y-2">
          {dadosMateriais.distribuicaoPorCategoria.map((cat) => (
            <div key={cat.categoria} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.categoria}`}
                checked={filtroCategorias.includes(cat.categoria)}
                onCheckedChange={() => toggleFiltroCategoria(cat.categoria)}
              />
              <Label
                htmlFor={`cat-${cat.categoria}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {cat.categoria}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={limparFiltros}>
          Limpar Filtros
        </Button>
        <Button size="sm">Aplicar Filtros</Button>
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

  // Componente para exibir gráficos (placeholder)
  const ChartPlaceholder = ({
    icon,
    text,
    height = "300px",
  }: {
    icon: React.ReactNode
    text: string
    height?: string
  }) => (
    <div className="w-full bg-muted/20 dark:bg-muted/10 rounded-md flex items-center justify-center" style={{ height }}>
      {icon}
      <span className="ml-2 text-muted-foreground">{text}</span>
    </div>
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          {/* Filtros para desktop */}
          {!isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
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
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}

          {/* Botão de tema para desktop */}
          {!isMobile && <ThemeToggle />}

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
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatórios
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
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
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              R${" "}
              {isMobile
                ? (dadosFinanceiros.receitas.atual / 1000).toFixed(0) + "K"
                : dadosFinanceiros.receitas.atual.toLocaleString("pt-BR")}
            </div>
            <div className="flex items-center pt-1">
              {dadosFinanceiros.receitas.variacao > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={dadosFinanceiros.receitas.variacao > 0 ? "text-green-500" : "text-red-500"}>
                {dadosFinanceiros.receitas.variacao.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dadosObras.emAndamento}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                {dadosObras.atrasadas} com atraso ({Math.round((dadosObras.atrasadas / dadosObras.emAndamento) * 100)}%)
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
            <div className="text-xl md:text-2xl font-bold">{dadosFuncionarios.total}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                Produtividade: {dadosFuncionarios.produtividade[dadosFuncionarios.produtividade.length - 1].indice}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {dadosMateriais.baixoEstoque + dadosMateriais.semEstoque}
            </div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                {dadosMateriais.semEstoque} sem estoque, {dadosMateriais.baixoEstoque} baixo estoque
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <SelectItem value="materiais">Materiais</SelectItem>
              <SelectItem value="fornecedores">Fornecedores</SelectItem>
            </SelectContent>
          </Select>

          {/* Conteúdo das tabs para mobile */}
          {activeTab === "financeiro" && (
            <div className="space-y-4">
              {/* Fluxo de Caixa */}
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                  <CardDescription>Receitas vs. Despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Fluxo de Caixa"
                    height="200px"
                  />
                </CardContent>
              </Card>

              {/* Distribuição de Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                  <CardDescription>Categorias principais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                    height="200px"
                  />
                </CardContent>
              </Card>

              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>Comparativo com período anterior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Receitas</span>
                        <span className="text-sm font-medium">
                          R$ {dadosFinanceiros.receitas.atual.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>vs. R$ {dadosFinanceiros.receitas.anterior.toLocaleString("pt-BR")}</span>
                        <span className="ml-auto flex items-center">
                          {dadosFinanceiros.receitas.variacao > 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span className={dadosFinanceiros.receitas.variacao > 0 ? "text-green-500" : "text-red-500"}>
                            {dadosFinanceiros.receitas.variacao.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Despesas</span>
                        <span className="text-sm font-medium">
                          R$ {dadosFinanceiros.despesas.atual.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>vs. R$ {dadosFinanceiros.despesas.anterior.toLocaleString("pt-BR")}</span>
                        <span className="ml-auto flex items-center">
                          {dadosFinanceiros.despesas.variacao > 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-red-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
                          )}
                          <span className={dadosFinanceiros.despesas.variacao > 0 ? "text-red-500" : "text-green-500"}>
                            {dadosFinanceiros.despesas.variacao.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lucro</span>
                        <span className="text-sm font-medium">
                          R$ {dadosFinanceiros.lucro.atual.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>vs. R$ {dadosFinanceiros.lucro.anterior.toLocaleString("pt-BR")}</span>
                        <span className="ml-auto flex items-center">
                          {dadosFinanceiros.lucro.variacao > 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span className={dadosFinanceiros.lucro.variacao > 0 ? "text-green-500" : "text-red-500"}>
                            {dadosFinanceiros.lucro.variacao.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status de Orçamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Status de Orçamentos</CardTitle>
                  <CardDescription>Visão geral dos orçamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.total}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Aprovados</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.aprovados}</span>
                      </div>
                      <Progress
                        value={(dadosFinanceiros.orcamentos.aprovados / dadosFinanceiros.orcamentos.total) * 100}
                        className="h-2 bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pendentes</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.pendentes}</span>
                      </div>
                      <Progress
                        value={(dadosFinanceiros.orcamentos.pendentes / dadosFinanceiros.orcamentos.total) * 100}
                        className="h-2 bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rejeitados</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.rejeitados}</span>
                      </div>
                      <Progress
                        value={(dadosFinanceiros.orcamentos.rejeitados / dadosFinanceiros.orcamentos.total) * 100}
                        className="h-2 bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalhamento de Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Despesas</CardTitle>
                  <CardDescription>Principais categorias de despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor (R$)</TableHead>
                          <TableHead>%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosFinanceiros.distribuicaoDespesas.map((item) => (
                          <TableRow key={item.categoria}>
                            <TableCell className="font-medium">{item.categoria}</TableCell>
                            <TableCell>{item.valor.toLocaleString("pt-BR")}</TableCell>
                            <TableCell>{item.porcentagem}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "obras" && (
            <div className="space-y-4">
              {/* Progresso das Obras */}
              <Card>
                <CardHeader>
                  <CardTitle>Progresso das Obras</CardTitle>
                  <CardDescription>Status atual das obras em andamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dadosObras.obras
                      .filter((obra) => obra.status === "Em andamento")
                      .map((obra) => (
                        <div key={obra.nome} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{obra.nome}</span>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge
                                  variant={obra.prazo === "No prazo" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {obra.prazo}
                                </Badge>
                                <Badge
                                  variant={obra.orcamento === "Dentro do orçamento" ? "outline" : "secondary"}
                                  className="text-xs"
                                >
                                  {obra.orcamento}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{obra.progresso}%</span>
                          </div>
                          <Progress value={obra.progresso} className="h-2" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Obras por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                    height="200px"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosObras.distribuicaoPorTipo.map((tipo) => (
                      <div key={tipo.tipo} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{tipo.tipo}</span>
                        </div>
                        <span className="text-sm">
                          {tipo.quantidade} ({tipo.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Obras Concluídas */}
              <Card>
                <CardHeader>
                  <CardTitle>Obras Concluídas</CardTitle>
                  <CardDescription>Histórico de obras finalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Obra</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead>Orçamento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosObras.obras
                          .filter((obra) => obra.status === "Concluída")
                          .map((obra) => (
                            <TableRow key={obra.nome}>
                              <TableCell className="font-medium">{obra.nome}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={obra.prazo === "No prazo" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {obra.prazo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    obra.orcamento === "Dentro do orçamento"
                                      ? "outline"
                                      : obra.orcamento === "Abaixo do orçamento"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {obra.orcamento}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "funcionarios" && (
            <div className="space-y-4">
              {/* Produtividade */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtividade</CardTitle>
                  <CardDescription>Índice de produtividade mensal</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Produtividade"
                    height="200px"
                  />
                </CardContent>
              </Card>

              {/* Distribuição por Departamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Departamento</CardTitle>
                  <CardDescription>Funcionários por área</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                    height="200px"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosFuncionarios.distribuicaoPorDepartamento.map((dept) => (
                      <div key={dept.departamento} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{dept.departamento}</span>
                        </div>
                        <span className="text-sm">
                          {dept.quantidade} ({dept.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Funcionários */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Funcionários</CardTitle>
                  <CardDescription>Melhores avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dadosFuncionarios.topFuncionarios.map((funcionario, index) => (
                      <div key={funcionario.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-10 w-10">
                            {funcionario.avatar ? (
                              <AvatarImage src={funcionario.avatar || "/placeholder.svg"} alt={funcionario.nome} />
                            ) : (
                              <AvatarFallback>
                                {funcionario.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{funcionario.nome}</p>
                            <p className="text-xs text-muted-foreground">{funcionario.cargo}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{funcionario.avaliacao}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(funcionario.avaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "materiais" && (
            <div className="space-y-4">
              {/* Consumo Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle>Consumo Mensal</CardTitle>
                  <CardDescription>Valor de materiais consumidos por mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Consumo"
                    height="200px"
                  />
                </CardContent>
              </Card>

              {/* Distribuição por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Valor em estoque por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                    height="200px"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosMateriais.distribuicaoPorCategoria.map((cat) => (
                      <div key={cat.categoria} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{cat.categoria}</span>
                        </div>
                        <span className="text-sm">
                          R$ {cat.valor.toLocaleString("pt-BR")} ({cat.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Materiais Críticos */}
              <Card>
                <CardHeader>
                  <CardTitle>Materiais Críticos</CardTitle>
                  <CardDescription>Itens com estoque baixo ou crítico</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosMateriais.materiaisCriticos.map((material) => (
                          <TableRow key={material.nome}>
                            <TableCell className="font-medium">{material.nome}</TableCell>
                            <TableCell>
                              {material.estoque} {material.unidade}
                            </TableCell>
                            <TableCell>
                              <Badge variant={material.status === "Crítico" ? "destructive" : "secondary"}>
                                {material.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "fornecedores" && (
            <div className="space-y-4">
              {/* Avaliação de Fornecedores */}
              <Card>
                <CardHeader>
                  <CardTitle>Avaliação de Fornecedores</CardTitle>
                  <CardDescription>Pontuação média por fornecedor</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Avaliação"
                    height="200px"
                  />
                </CardContent>
              </Card>

              {/* Distribuição por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Fornecedores por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                    height="200px"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosFornecedores.distribuicaoPorTipo.map((tipo) => (
                      <div key={tipo.tipo} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{tipo.tipo}</span>
                        </div>
                        <span className="text-sm">
                          {tipo.quantidade} ({tipo.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Fornecedores */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Fornecedores</CardTitle>
                  <CardDescription>Melhores avaliações e pontualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Avaliação</TableHead>
                          <TableHead>Pontualidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosFornecedores.topFornecedores.map((fornecedor) => (
                          <TableRow key={fornecedor.nome}>
                            <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={fornecedor.pontualidade} className="h-2 w-16" />
                                <span className="text-sm">{fornecedor.pontualidade}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="financeiro" className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="obras">Obras</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          </TabsList>

          {/* Análise Financeira */}
          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                  <CardDescription>Receitas vs. Despesas (últimos 12 meses)</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartPlaceholder
                    icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Fluxo de Caixa"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                  <CardDescription>Categorias principais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>Comparativo com período anterior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Receitas</span>
                        <span className="text-sm font-medium">
                          R$ {dadosFinanceiros.receitas.atual.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>vs. R$ {dadosFinanceiros.receitas.anterior.toLocaleString("pt-BR")}</span>
                        <span className="ml-auto flex items-center">
                          {dadosFinanceiros.receitas.variacao > 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span className={dadosFinanceiros.receitas.variacao > 0 ? "text-green-500" : "text-red-500"}>
                            {dadosFinanceiros.receitas.variacao.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Despesas</span>
                        <span className="text-sm font-medium">
                          R$ {dadosFinanceiros.despesas.atual.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>vs. R$ {dadosFinanceiros.despesas.anterior.toLocaleString("pt-BR")}</span>
                        <span className="ml-auto flex items-center">
                          {dadosFinanceiros.despesas.variacao > 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-red-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
                          )}
                          <span className={dadosFinanceiros.despesas.variacao > 0 ? "text-red-500" : "text-green-500"}>
                            {dadosFinanceiros.despesas.variacao.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lucro</span>
                        <span className="text-sm font-medium">
                          R$ {dadosFinanceiros.lucro.atual.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>vs. R$ {dadosFinanceiros.lucro.anterior.toLocaleString("pt-BR")}</span>
                        <span className="ml-auto flex items-center">
                          {dadosFinanceiros.lucro.variacao > 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span className={dadosFinanceiros.lucro.variacao > 0 ? "text-green-500" : "text-red-500"}>
                            {dadosFinanceiros.lucro.variacao.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status de Orçamentos</CardTitle>
                  <CardDescription>Visão geral dos orçamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.total}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Aprovados</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.aprovados}</span>
                      </div>
                      <Progress
                        value={(dadosFinanceiros.orcamentos.aprovados / dadosFinanceiros.orcamentos.total) * 100}
                        className="h-2 bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pendentes</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.pendentes}</span>
                      </div>
                      <Progress
                        value={(dadosFinanceiros.orcamentos.pendentes / dadosFinanceiros.orcamentos.total) * 100}
                        className="h-2 bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rejeitados</span>
                        <span className="text-sm font-medium">{dadosFinanceiros.orcamentos.rejeitados}</span>
                      </div>
                      <Progress
                        value={(dadosFinanceiros.orcamentos.rejeitados / dadosFinanceiros.orcamentos.total) * 100}
                        className="h-2 bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status de Pagamentos</CardTitle>
                  <CardDescription>Situação atual dos pagamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="relative w-40 h-40">
                      <div className="h-40 w-40 bg-muted/20 dark:bg-muted/10 rounded-full flex items-center justify-center">
                        <PieChart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold">{dadosFinanceiros.pagamentos.emDia}%</span>
                        <span className="text-sm text-muted-foreground">Em dia</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                        <span className="text-sm">Em dia</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
                        <span className="text-sm">Atrasados</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento de Despesas</CardTitle>
                <CardDescription>Principais categorias de despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Valor (R$)</TableHead>
                        <TableHead>Porcentagem</TableHead>
                        <TableHead>Distribuição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosFinanceiros.distribuicaoDespesas.map((item) => (
                        <TableRow key={item.categoria}>
                          <TableCell className="font-medium">{item.categoria}</TableCell>
                          <TableCell>{item.valor.toLocaleString("pt-BR")}</TableCell>
                          <TableCell>{item.porcentagem}%</TableCell>
                          <TableCell>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${item.porcentagem}%` }}
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
          </TabsContent>

          {/* Análise de Obras */}
          <TabsContent value="obras" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Progresso das Obras</CardTitle>
                  <CardDescription>Status atual das obras em andamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dadosObras.obras
                      .filter((obra) => obra.status === "Em andamento")
                      .map((obra) => (
                        <div key={obra.nome} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{obra.nome}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={obra.prazo === "No prazo" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {obra.prazo}
                                </Badge>
                                <Badge
                                  variant={obra.orcamento === "Dentro do orçamento" ? "outline" : "secondary"}
                                  className="text-xs"
                                >
                                  {obra.orcamento}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{obra.progresso}%</span>
                          </div>
                          <Progress value={obra.progresso} className="h-2" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Obras por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosObras.distribuicaoPorTipo.map((tipo) => (
                      <div key={tipo.tipo} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{tipo.tipo}</span>
                        </div>
                        <span className="text-sm">
                          {tipo.quantidade} ({tipo.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Prazos</CardTitle>
                  <CardDescription>Evolução do cumprimento de prazos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Tendência"
                    height="250px"
                  />
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>No prazo</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Atrasadas</span>
                    </div>
                    <div>
                      <span>Média de atraso: 15 dias</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Obras Concluídas</CardTitle>
                  <CardDescription>Histórico de obras finalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Obra</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead>Orçamento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosObras.obras
                          .filter((obra) => obra.status === "Concluída")
                          .map((obra) => (
                            <TableRow key={obra.nome}>
                              <TableCell className="font-medium">{obra.nome}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={obra.prazo === "No prazo" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {obra.prazo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    obra.orcamento === "Dentro do orçamento"
                                      ? "outline"
                                      : obra.orcamento === "Abaixo do orçamento"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {obra.orcamento}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Desempenho</CardTitle>
                <CardDescription>Métricas detalhadas por obra</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Obra</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Orçamento</TableHead>
                        <TableHead>Eficiência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosObras.obras.map((obra) => (
                        <TableRow key={obra.nome}>
                          <TableCell className="font-medium">{obra.nome}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={obra.progresso} className="h-2 w-16" />
                              <span className="text-sm">{obra.progresso}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={obra.status === "Concluída" ? "default" : "secondary"}>{obra.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={obra.prazo === "No prazo" ? "outline" : "destructive"} className="text-xs">
                              {obra.prazo}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                obra.orcamento === "Dentro do orçamento"
                                  ? "outline"
                                  : obra.orcamento === "Abaixo do orçamento"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {obra.orcamento}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {obra.status === "Concluída" ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm">Alta</span>
                              </div>
                            ) : obra.prazo === "No prazo" && obra.orcamento === "Dentro do orçamento" ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm">Alta</span>
                              </div>
                            ) : obra.prazo === "Atrasada" && obra.orcamento === "Acima do orçamento" ? (
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-sm">Baixa</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm">Média</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análise de Funcionários */}
          <TabsContent value="funcionarios" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Produtividade</CardTitle>
                  <CardDescription>Índice de produtividade mensal</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartPlaceholder
                    icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Produtividade"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Distribuição por Departamento</CardTitle>
                  <CardDescription>Funcionários por área</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosFuncionarios.distribuicaoPorDepartamento.map((dept) => (
                      <div key={dept.departamento} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{dept.departamento}</span>
                        </div>
                        <span className="text-sm">
                          {dept.quantidade} ({dept.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Funcionários</CardTitle>
                  <CardDescription>Melhores avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dadosFuncionarios.topFuncionarios.map((funcionario, index) => (
                      <div key={funcionario.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-10 w-10">
                            {funcionario.avatar ? (
                              <AvatarImage src={funcionario.avatar || "/placeholder.svg"} alt={funcionario.nome} />
                            ) : (
                              <AvatarFallback>
                                {funcionario.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{funcionario.nome}</p>
                            <p className="text-xs text-muted-foreground">{funcionario.cargo}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{funcionario.avaliacao}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(funcionario.avaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custo de Mão de Obra</CardTitle>
                  <CardDescription>Análise de custos com funcionários</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">
                        R$ {dadosFuncionarios.custoMensal.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-sm text-muted-foreground">Custo mensal total</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Custo médio por funcionário</span>
                          <span className="text-sm font-medium">
                            R${" "}
                            {Math.round(dadosFuncionarios.custoMensal / dadosFuncionarios.total).toLocaleString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Custo por departamento</span>
                        </div>
                        <div className="space-y-2">
                          {dadosFuncionarios.distribuicaoPorDepartamento.map((dept) => (
                            <div key={dept.departamento} className="flex items-center justify-between text-sm">
                              <span>{dept.departamento}</span>
                              <span>
                                R${" "}
                                {Math.round(dadosFuncionarios.custoMensal * (dept.porcentagem / 100)).toLocaleString(
                                  "pt-BR",
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Produtividade</CardTitle>
                <CardDescription>Métricas detalhadas por departamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Funcionários</TableHead>
                        <TableHead>Custo Mensal (R$)</TableHead>
                        <TableHead>Produtividade</TableHead>
                        <TableHead>Custo/Produtividade</TableHead>
                        <TableHead>Eficiência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosFuncionarios.distribuicaoPorDepartamento.map((dept) => {
                        const custoDepto = Math.round(dadosFuncionarios.custoMensal * (dept.porcentagem / 100))
                        const produtividadeDepto = 75 + Math.floor(Math.random() * 20) // Simulação
                        const custoProdutividade = Math.round(custoDepto / produtividadeDepto)

                        return (
                          <TableRow key={dept.departamento}>
                            <TableCell className="font-medium">{dept.departamento}</TableCell>
                            <TableCell>{dept.quantidade}</TableCell>
                            <TableCell>{custoDepto.toLocaleString("pt-BR")}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={produtividadeDepto} className="h-2 w-16" />
                                <span className="text-sm">{produtividadeDepto}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{custoProdutividade.toLocaleString("pt-BR")}</TableCell>
                            <TableCell>
                              {produtividadeDepto >= 90 ? (
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-sm">Alta</span>
                                </div>
                              ) : produtividadeDepto >= 80 ? (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="text-sm">Média</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                                  <span className="text-sm">Baixa</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análise de Materiais */}
          <TabsContent value="materiais" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Consumo Mensal</CardTitle>
                  <CardDescription>Valor de materiais consumidos por mês</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartPlaceholder
                    icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Consumo"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Valor em estoque por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosMateriais.distribuicaoPorCategoria.map((cat) => (
                      <div key={cat.categoria} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{cat.categoria}</span>
                        </div>
                        <span className="text-sm">
                          R$ {cat.valor.toLocaleString("pt-BR")} ({cat.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Estoque</CardTitle>
                  <CardDescription>Visão geral do estoque</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40">
                      <div className="h-40 w-40 bg-muted/20 dark:bg-muted/10 rounded-full flex items-center justify-center">
                        <PieChart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold">
                          {Math.round((dadosMateriais.emEstoque / dadosMateriais.total) * 100)}%
                        </span>
                        <span className="text-sm text-muted-foreground">Em estoque</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                        <span className="text-sm">Em estoque</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm">Baixo estoque</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
                        <span className="text-sm">Sem estoque</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Valor total em estoque</span>
                        <span className="text-sm font-medium">
                          R$ {dadosMateriais.valorTotal.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Consumo médio mensal</span>
                        <span className="text-sm font-medium">
                          R${" "}
                          {Math.round(
                            dadosMateriais.consumoMensal.reduce((acc, item) => acc + item.valor, 0) /
                              dadosMateriais.consumoMensal.length,
                          ).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Materiais Críticos</CardTitle>
                  <CardDescription>Itens com estoque baixo ou crítico</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosMateriais.materiaisCriticos.map((material) => (
                          <TableRow key={material.nome}>
                            <TableCell className="font-medium">{material.nome}</TableCell>
                            <TableCell>{material.estoque}</TableCell>
                            <TableCell>{material.unidade}</TableCell>
                            <TableCell>
                              <Badge variant={material.status === "Crítico" ? "destructive" : "secondary"}>
                                {material.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Consumo</CardTitle>
                <CardDescription>Consumo por categoria e obra</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder
                  icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                  text="Gráfico de Consumo por Obra e Categoria"
                  height="350px"
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top 5 Categorias (Consumo)</h4>
                    <div className="space-y-2">
                      {dadosMateriais.distribuicaoPorCategoria
                        .sort((a, b) => b.valor - a.valor)
                        .slice(0, 5)
                        .map((cat, index) => (
                          <div key={cat.categoria} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">
                                {index + 1}
                              </div>
                              <span className="text-sm">{cat.categoria}</span>
                            </div>
                            <span className="text-sm">R$ {cat.valor.toLocaleString("pt-BR")}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top 5 Obras (Consumo)</h4>
                    <div className="space-y-2">
                      {dadosObras.obras
                        .filter((obra) => obra.status === "Em andamento")
                        .slice(0, 5)
                        .map((obra, index) => (
                          <div key={obra.nome} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">
                                {index + 1}
                              </div>
                              <span className="text-sm">{obra.nome}</span>
                            </div>
                            <span className="text-sm">
                              R$ {(Math.random() * 50000 + 20000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análise de Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Avaliação de Fornecedores</CardTitle>
                  <CardDescription>Pontuação média por fornecedor</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartPlaceholder
                    icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Avaliação"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Fornecedores por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder
                    icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
                    text="Gráfico de Distribuição"
                  />
                  <div className="mt-4 space-y-2">
                    {dadosFornecedores.distribuicaoPorTipo.map((tipo) => (
                      <div key={tipo.tipo} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{tipo.tipo}</span>
                        </div>
                        <span className="text-sm">
                          {tipo.quantidade} ({tipo.porcentagem}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Fornecedores</CardTitle>
                  <CardDescription>Melhores avaliações e pontualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Avaliação</TableHead>
                          <TableHead>Pontualidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosFornecedores.topFornecedores.map((fornecedor) => (
                          <TableRow key={fornecedor.nome}>
                            <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                            <TableCell>{fornecedor.tipo}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={fornecedor.pontualidade} className="h-2 w-16" />
                                <span className="text-sm">{fornecedor.pontualidade}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Preços</CardTitle>
                  <CardDescription>Economia por material</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Melhor Preço</TableHead>
                          <TableHead>Economia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosFornecedores.comparativoPrecos.map((item) => (
                          <TableRow key={item.material}>
                            <TableCell className="font-medium">{item.material}</TableCell>
                            <TableCell>{item.melhorPreco}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                                <span className="text-green-500">{item.economiaPercentual}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Desempenho</CardTitle>
                <CardDescription>Métricas detalhadas por fornecedor</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder
                  icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                  text="Gráfico de Desempenho Comparativo"
                  height="350px"
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Economia Total</h4>
                    <div className="flex flex-col items-center justify-center p-4 bg-muted/20 dark:bg-muted/10 rounded-md">
                      <span className="text-3xl font-bold">R$ 125.000</span>
                      <span className="text-sm text-muted-foreground">Economia nos últimos 6 meses</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Oportunidades de Economia</h4>
                    <div className="flex flex-col items-center justify-center p-4 bg-muted/20 dark:bg-muted/10 rounded-md">
                      <span className="text-3xl font-bold">R$ 85.000</span>
                      <span className="text-sm text-muted-foreground">Potencial de economia identificado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
