"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
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
  Copy,
  Filter,
  ChevronDown,
  Star,
  CreditCard,
  History,
  Download,
  FileText,
  Upload,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"

// Dados de exemplo - funcionários ativos
const funcionariosAtivos = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Engenheiro Civil",
    departamento: "Projetos",
    dataContratacao: "15/03/2020",
    dataDemissao: null,
    status: "Ativo",
    diaria: 350.0,
    diasTrabalhados: 22,
    valorAdicional: 500.0,
    descontos: 150.0,
    adiantamento: 1000.0,
    chavePix: "joao.silva@exemplo.com",
    avaliacao: 4.5,
    observacao:
      "Excelente profissional, sempre pontual e comprometido com os prazos. Demonstra grande conhecimento técnico e liderança.",
    ultimoComprovante: "comprovante_joao_silva_maio2.pdf",
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    cargo: "Arquiteta",
    departamento: "Design",
    dataContratacao: "22/07/2019",
    dataDemissao: null,
    status: "Ativo",
    diaria: 320.0,
    diasTrabalhados: 20,
    valorAdicional: 0.0,
    descontos: 0.0,
    adiantamento: 0.0,
    chavePix: "12345678900",
    avaliacao: 5,
    observacao:
      "Profissional excepcional, com grande criatividade e atenção aos detalhes. Seus projetos sempre superam as expectativas dos clientes.",
    ultimoComprovante: "comprovante_maria_oliveira_maio.pdf",
  },
  {
    id: 3,
    nome: "Pedro Santos",
    cargo: "Mestre de Obras",
    departamento: "Construção",
    dataContratacao: "10/01/2021",
    dataDemissao: null,
    status: "Ativo",
    diaria: 250.0,
    diasTrabalhados: 23,
    valorAdicional: 750.0,
    descontos: 200.0,
    adiantamento: 500.0,
    chavePix: "pedro.santos@exemplo.com",
    avaliacao: 3.5,
    observacao:
      "Bom profissional, mas às vezes tem dificuldade em cumprir prazos. Precisa melhorar a comunicação com a equipe.",
    ultimoComprovante: null,
  },
  {
    id: 4,
    nome: "Ana Costa",
    cargo: "Gerente de Projetos",
    departamento: "Administração",
    dataContratacao: "05/11/2018",
    dataDemissao: null,
    status: "Ativo",
    diaria: 400.0,
    diasTrabalhados: 21,
    valorAdicional: 1200.0,
    descontos: 350.0,
    adiantamento: 0.0,
    chavePix: "98765432100",
    avaliacao: 4,
    observacao:
      "Ótima gestora, organizada e eficiente. Consegue coordenar múltiplos projetos simultaneamente com excelência.",
    ultimoComprovante: "comprovante_ana_pereira_maio.pdf",
  },
  {
    id: 5,
    nome: "Carlos Ferreira",
    cargo: "Técnico em Segurança",
    departamento: "Segurança",
    dataContratacao: "18/09/2022",
    dataDemissao: null,
    status: "Ativo",
    diaria: 220.0,
    diasTrabalhados: 22,
    valorAdicional: 0.0,
    descontos: 100.0,
    adiantamento: 300.0,
    chavePix: "carlos.ferreira@exemplo.com",
    avaliacao: 3,
    observacao: "Profissional dedicado, mas precisa atualizar seus conhecimentos em normas de segurança mais recentes.",
    ultimoComprovante: null,
  },
]

// Histórico de pagamentos
const historicoPagamentos = [
  {
    id: 1,
    funcionarioId: 1,
    data: "2023-05-15",
    valor: 7200.0,
    conta: "Banco do Brasil - Conta Principal",
    quinzena: "Primeira quinzena de Maio/2023",
    diasTrabalhados: 15,
    valorAdicional: 300.0,
    descontos: 100.0,
    adiantamento: 0.0,
    comprovante: "comprovante_joao_silva_maio1.pdf",
  },
  {
    id: 2,
    funcionarioId: 1,
    data: "2023-05-30",
    valor: 7500.0,
    conta: "Banco do Brasil - Conta Principal",
    quinzena: "Segunda quinzena de Maio/2023",
    diasTrabalhados: 16,
    valorAdicional: 400.0,
    descontos: 100.0,
    adiantamento: 0.0,
    comprovante: "comprovante_joao_silva_maio2.pdf",
  },
  {
    id: 3,
    funcionarioId: 1,
    data: "2023-06-15",
    valor: 7300.0,
    conta: "Banco do Brasil - Conta Principal",
    quinzena: "Primeira quinzena de Junho/2023",
    diasTrabalhados: 15,
    valorAdicional: 350.0,
    descontos: 150.0,
    adiantamento: 0.0,
    comprovante: null,
  },
  {
    id: 4,
    funcionarioId: 2,
    data: "2023-05-15",
    valor: 6400.0,
    conta: "Banco do Brasil - Conta Principal",
    quinzena: "Primeira quinzena de Maio/2023",
    diasTrabalhados: 15,
    valorAdicional: 0.0,
    descontos: 0.0,
    adiantamento: 0.0,
    comprovante: "comprovante_maria_oliveira_maio1.pdf",
  },
  {
    id: 5,
    funcionarioId: 2,
    data: "2023-05-30",
    valor: 6400.0,
    conta: "Banco do Brasil - Conta Principal",
    quinzena: "Segunda quinzena de Maio/2023",
    diasTrabalhados: 15,
    valorAdicional: 0.0,
    descontos: 0.0,
    adiantamento: 0.0,
    comprovante: "comprovante_maria_oliveira_maio.pdf",
  },
  {
    id: 6,
    funcionarioId: 3,
    data: "2023-06-15",
    valor: 5750.0,
    conta: "Itaú - Conta Empresarial",
    quinzena: "Primeira quinzena de Junho/2023",
    diasTrabalhados: 15,
    valorAdicional: 500.0,
    descontos: 100.0,
    adiantamento: 250.0,
    comprovante: null,
  },
  {
    id: 7,
    funcionarioId: 4,
    data: "2023-06-15",
    valor: 8400.0,
    conta: "Itaú - Conta Empresarial",
    quinzena: "Primeira quinzena de Junho/2023",
    diasTrabalhados: 15,
    valorAdicional: 800.0,
    descontos: 200.0,
    adiantamento: 0.0,
    comprovante: "comprovante_ana_pereira_junho1.pdf",
  },
  {
    id: 8,
    funcionarioId: 5,
    data: "2023-06-15",
    valor: 4840.0,
    conta: "Itaú - Conta Empresarial",
    quinzena: "Primeira quinzena de Junho/2023",
    diasTrabalhados: 15,
    valorAdicional: 0.0,
    descontos: 60.0,
    adiantamento: 200.0,
    comprovante: null,
  },
]

// Contas bancárias disponíveis
const contasBancarias = [
  { id: 1, nome: "Banco do Brasil - Conta Principal", agencia: "1234-5", conta: "12345-6" },
  { id: 2, nome: "Itaú - Conta Empresarial", agencia: "4321-0", conta: "54321-7" },
  { id: 3, nome: "Santander - Conta Pagamentos", agencia: "6789-1", conta: "67890-2" },
  { id: 4, nome: "Bradesco - Conta Secundária", agencia: "9876-5", conta: "98765-4" },
]

// Departamentos disponíveis para filtro
const departamentos = ["Projetos", "Design", "Construção", "Administração", "Segurança"]

// Cargos disponíveis para filtro
const cargos = ["Engenheiro Civil", "Arquiteta", "Mestre de Obras", "Gerente de Projetos", "Técnico em Segurança"]

// Componente para exibir as estrelas de avaliação
function RatingStars({ rating }: { rating: number }) {
  // Arredonda para o meio mais próximo (0, 0.5, 1, 1.5, etc.)
  const roundedRating = Math.round(rating * 2) / 2

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= roundedRating) {
          // Estrela cheia
          return <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        } else if (star - 0.5 === roundedRating) {
          // Meia estrela (simulada com uma estrela preenchida parcialmente)
          return (
            <div key={star} className="relative h-4 w-4">
              <Star className="absolute h-4 w-4 text-yellow-400" />
              <div className="absolute h-4 w-2 overflow-hidden">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )
        } else {
          // Estrela vazia
          return <Star key={star} className="h-4 w-4 text-yellow-400" />
        }
      })}
      <span className="ml-1 text-sm text-gray-600">{roundedRating.toFixed(1)}</span>
    </div>
  )
}

export default function FuncionariosPage() {
  // Estado para pesquisa
  const [searchTerm, setSearchTerm] = useState("")

  // Estado para filtros
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string[]>([])
  const [filtroCargo, setFiltroCargo] = useState<string[]>([])

  // Estado para o diálogo de pagamento
  const [dialogPagamentoAberto, setDialogPagamentoAberto] = useState(false)
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<(typeof funcionariosAtivos)[0] | null>(null)
  const [contaSelecionada, setContaSelecionada] = useState("")

  // Estado para o filtro de data no histórico
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // Determinar a quinzena atual
  const hoje = new Date()
  const diaAtual = hoje.getDate()
  const ehPrimeiraQuinzena = diaAtual <= 15
  const inicioQuinzena = ehPrimeiraQuinzena
    ? new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    : new Date(hoje.getFullYear(), hoje.getMonth(), 16)
  const fimQuinzena = ehPrimeiraQuinzena ? new Date(hoje.getFullYear(), hoje.getMonth(), 15) : endOfMonth(hoje)

  const quinzenaAtual = ehPrimeiraQuinzena
    ? `Primeira quinzena de ${format(hoje, "MMMM/yyyy", { locale: ptBR })}`
    : `Segunda quinzena de ${format(hoje, "MMMM/yyyy", { locale: ptBR })}`

  // Calcular o valor total da quinzena atual
  const valorTotalQuinzena = funcionariosAtivos.reduce((total, funcionario) => {
    const valorFuncionario =
      funcionario.diaria * funcionario.diasTrabalhados +
      funcionario.valorAdicional -
      funcionario.descontos -
      funcionario.adiantamento
    return total + valorFuncionario
  }, 0)

  // Função para filtrar funcionários ativos
  const funcionariosAtivosFiltrados = funcionariosAtivos.filter((funcionario) => {
    // Filtro por termo de pesquisa
    const matchesSearch =
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.departamento.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por departamento
    const matchesDepartamento = filtroDepartamento.length === 0 || filtroDepartamento.includes(funcionario.departamento)

    // Filtro por cargo
    const matchesCargo = filtroCargo.length === 0 || filtroCargo.includes(funcionario.cargo)

    return matchesSearch && matchesDepartamento && matchesCargo
  })

  // Filtrar histórico de pagamentos por data
  const historicoPagamentosFiltrados = historicoPagamentos.filter((pagamento) => {
    if (!dateRange?.from) return true

    const dataPagamento = new Date(pagamento.data)

    if (dateRange.to) {
      return isWithinInterval(dataPagamento, {
        start: dateRange.from,
        end: dateRange.to,
      })
    }

    return format(dataPagamento, "yyyy-MM-dd") === format(dateRange.from, "yyyy-MM-dd")
  })

  // Função para copiar chave PIX
  const copiarChavePix = (chavePix: string) => {
    navigator.clipboard.writeText(chavePix)
    toast({
      title: "Chave PIX copiada",
      description: "A chave PIX foi copiada para a área de transferência.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para abrir o diálogo de pagamento
  const abrirDialogoPagamento = (funcionario: (typeof funcionariosAtivos)[0]) => {
    setFuncionarioSelecionado(funcionario)
    setContaSelecionada("")
    setDialogPagamentoAberto(true)
  }

  // Função para processar pagamento
  const processarPagamento = () => {
    if (!funcionarioSelecionado || !contaSelecionada) return

    // Calcular o valor total a pagar
    const valorTotal =
      funcionarioSelecionado.diaria * funcionarioSelecionado.diasTrabalhados +
      funcionarioSelecionado.valorAdicional -
      funcionarioSelecionado.descontos -
      funcionarioSelecionado.adiantamento

    // Fechar o diálogo
    setDialogPagamentoAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Pagamento Processado",
      description: `Pagamento de R$ ${valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para ${funcionarioSelecionado.nome} foi processado com sucesso pela conta ${contaSelecionada}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para alternar seleção de departamento no filtro
  const toggleDepartamento = (departamento: string) => {
    setFiltroDepartamento((current) => {
      if (current.includes(departamento)) {
        return current.filter((d) => d !== departamento)
      } else {
        return [...current, departamento]
      }
    })
  }

  // Função para alternar seleção de cargo no filtro
  const toggleCargo = (cargo: string) => {
    setFiltroCargo((current) => {
      if (current.includes(cargo)) {
        return current.filter((c) => c !== cargo)
      } else {
        return [...current, cargo]
      }
    })
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroDepartamento([])
    setFiltroCargo([])
    setSearchTerm("")
  }

  // Função para exportar comprovante
  const exportarComprovante = (comprovante: string) => {
    // Simulação de download do comprovante
    toast({
      title: "Comprovante Exportado",
      description: `O comprovante ${comprovante} foi exportado com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/funcionarios/historico">
              <History className="mr-2 h-4 w-4" />
              Histórico Completo
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/funcionarios/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="quinzena">
        <TabsList className="mb-4">
          <TabsTrigger value="quinzena">Quinzena Atual</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="quinzena" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">{quinzenaAtual}</h3>
              <p className="text-sm text-muted-foreground">
                {format(inicioQuinzena, "dd/MM/yyyy")} até {format(fimQuinzena, "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total da Quinzena</p>
              <p className="text-2xl font-bold">
                R$ {valorTotalQuinzena.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar funcionários..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover open={filtroAberto} onOpenChange={setFiltroAberto}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrar por</h4>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Departamento</h5>
                    <div className="space-y-2">
                      {departamentos.map((departamento) => (
                        <div key={departamento} className="flex items-center space-x-2">
                          <Checkbox
                            id={`departamento-${departamento}`}
                            checked={filtroDepartamento.includes(departamento)}
                            onCheckedChange={() => toggleDepartamento(departamento)}
                          />
                          <label
                            htmlFor={`departamento-${departamento}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {departamento}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Cargo</h5>
                    <div className="space-y-2">
                      {cargos.map((cargo) => (
                        <div key={cargo} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cargo-${cargo}`}
                            checked={filtroCargo.includes(cargo)}
                            onCheckedChange={() => toggleCargo(cargo)}
                          />
                          <label
                            htmlFor={`cargo-${cargo}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cargo}
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

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Data de Contratação</TableHead>
                    <TableHead>Diária (R$)</TableHead>
                    <TableHead>Dias Trabalhados</TableHead>
                    <TableHead>Valor Adicional (R$)</TableHead>
                    <TableHead>Descontos (R$)</TableHead>
                    <TableHead>Adiantamento (R$)</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosAtivosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-24 text-center">
                        Nenhum funcionário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    funcionariosAtivosFiltrados.map((funcionario) => (
                      <TableRow key={funcionario.id}>
                        <TableCell className="font-medium">{funcionario.nome}</TableCell>
                        <TableCell>{funcionario.cargo}</TableCell>
                        <TableCell>{funcionario.departamento}</TableCell>
                        <TableCell>{funcionario.dataContratacao}</TableCell>
                        <TableCell>
                          {funcionario.diaria.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{funcionario.diasTrabalhados}</TableCell>
                        <TableCell>
                          {funcionario.valorAdicional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {funcionario.descontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {funcionario.adiantamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={() => copiarChavePix(funcionario.chavePix)}
                          >
                            <span className="truncate max-w-[100px]">{funcionario.chavePix}</span>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  <RatingStars rating={funcionario.avaliacao} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{funcionario.observacao}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                            {funcionario.status}
                          </div>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/funcionarios/${funcionario.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copiarChavePix(funcionario.chavePix)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Chave PIX
                              </DropdownMenuItem>
                              {funcionario.ultimoComprovante && (
                                <DropdownMenuItem onClick={() => exportarComprovante(funcionario.ultimoComprovante!)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Exportar Comprovante
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => abrirDialogoPagamento(funcionario)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pagar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Histórico de Pagamentos</h3>
              <p className="text-sm text-muted-foreground">Visualize todos os pagamentos realizados</p>
            </div>
            <div>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Filtrar por período"
                align="end"
                locale={ptBR}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Quinzena</TableHead>
                    <TableHead>Dias Trabalhados</TableHead>
                    <TableHead>Valor Adicional (R$)</TableHead>
                    <TableHead>Descontos (R$)</TableHead>
                    <TableHead>Adiantamento (R$)</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Valor Total (R$)</TableHead>
                    <TableHead>Comprovante</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoPagamentosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        Nenhum pagamento encontrado no período selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historicoPagamentosFiltrados.map((pagamento) => {
                      const funcionario = funcionariosAtivos.find((f) => f.id === pagamento.funcionarioId)
                      return (
                        <TableRow key={pagamento.id}>
                          <TableCell className="font-medium">
                            {funcionario?.nome || "Funcionário não encontrado"}
                          </TableCell>
                          <TableCell>{format(new Date(pagamento.data), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{pagamento.quinzena}</TableCell>
                          <TableCell>{pagamento.diasTrabalhados}</TableCell>
                          <TableCell>
                            {pagamento.valorAdicional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {pagamento.descontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {pagamento.adiantamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{pagamento.conta}</TableCell>
                          <TableCell className="font-medium">
                            R$ {pagamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {pagamento.comprovante ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-xs"
                                onClick={() => exportarComprovante(pagamento.comprovante!)}
                              >
                                <span className="truncate max-w-[100px]">{pagamento.comprovante}</span>
                                <Download className="h-3 w-3" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">Não disponível</span>
                            )}
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
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                {pagamento.comprovante && (
                                  <DropdownMenuItem onClick={() => exportarComprovante(pagamento.comprovante!)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar Comprovante
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
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
        </TabsContent>
      </Tabs>

      {/* Diálogo de Pagamento */}
      <Dialog open={dialogPagamentoAberto} onOpenChange={setDialogPagamentoAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Processar Pagamento</DialogTitle>
            <DialogDescription>Selecione a conta bancária para realizar o pagamento.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {funcionarioSelecionado && (
              <>
                <div className="space-y-1">
                  <h4 className="font-medium">Funcionário</h4>
                  <p>{funcionarioSelecionado.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Diária</h4>
                    <p>R$ {funcionarioSelecionado.diaria.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Dias Trabalhados</h4>
                    <p>{funcionarioSelecionado.diasTrabalhados}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Valor Adicional</h4>
                    <p>
                      R$ {funcionarioSelecionado.valorAdicional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Descontos</h4>
                    <p>R$ {funcionarioSelecionado.descontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Adiantamento</h4>
                    <p>
                      R$ {funcionarioSelecionado.adiantamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Valor Total</h4>
                    <p className="font-bold">
                      R${" "}
                      {(
                        funcionarioSelecionado.diaria * funcionarioSelecionado.diasTrabalhados +
                        funcionarioSelecionado.valorAdicional -
                        funcionarioSelecionado.descontos -
                        funcionarioSelecionado.adiantamento
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta Bancária</Label>
                  <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                    <SelectTrigger id="conta">
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contasBancarias.map((conta) => (
                        <SelectItem key={conta.id} value={conta.nome}>
                          {conta.nome} (Ag: {conta.agencia}, CC: {conta.conta})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comprovante-pagamento">Anexar Comprovante</Label>
                  <div className="flex items-center gap-2">
                    <Input id="comprovante-pagamento" type="file" className="flex-1" />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPagamentoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={processarPagamento} disabled={!contaSelecionada}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
