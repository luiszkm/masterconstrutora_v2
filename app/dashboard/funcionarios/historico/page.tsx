"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, MoreHorizontal, Filter, ChevronDown, Star, ArrowLeft, CopyPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, parseISO, isWithinInterval, addMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Dados de exemplo - funcionários ativos (mantidos para demonstração)
const funcionariosAtivos = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Engenheiro Civil",
    departamento: "Projetos",
    dataContratacao: "15/03/2020",
    dataDemissao: null,
    status: "Ativo",
    avaliacao: 4.5,
    observacao:
      "Excelente profissional, sempre pontual e comprometido com os prazos. Demonstra grande conhecimento técnico e liderança.",
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    cargo: "Arquiteta",
    departamento: "Design",
    dataContratacao: "22/07/2019",
    dataDemissao: null,
    status: "Ativo",
    avaliacao: 5,
    observacao:
      "Profissional excepcional, com grande criatividade e atenção aos detalhes. Seus projetos sempre superam as expectativas dos clientes.",
  },
  {
    id: 3,
    nome: "Pedro Santos",
    cargo: "Mestre de Obras",
    departamento: "Construção",
    dataContratacao: "10/01/2021",
    dataDemissao: null,
    status: "Ativo",
    avaliacao: 3.5,
    observacao:
      "Bom profissional, mas às vezes tem dificuldade em cumprir prazos. Precisa melhorar a comunicação com a equipe.",
  },
  {
    id: 4,
    nome: "Ana Costa",
    cargo: "Gerente de Projetos",
    departamento: "Administração",
    dataContratacao: "05/11/2018",
    dataDemissao: null,
    status: "Ativo",
    avaliacao: 4,
    observacao:
      "Ótima gestora, organizada e eficiente. Consegue coordenar múltiplos projetos simultaneamente com excelência.",
  },
  {
    id: 5,
    nome: "Carlos Ferreira",
    cargo: "Técnico em Segurança",
    departamento: "Segurança",
    dataContratacao: "18/09/2022",
    dataDemissao: null,
    status: "Ativo",
    avaliacao: 3,
    observacao: "Profissional dedicado, mas precisa atualizar seus conhecimentos em normas de segurança mais recentes.",
  },
]

// Dados de exemplo - ex-funcionários (mantidos para demonstração)
const exFuncionarios = [
  {
    id: 6,
    nome: "Roberto Almeida",
    cargo: "Engenheiro Elétrico",
    departamento: "Projetos",
    dataContratacao: "10/05/2018",
    dataDemissao: "15/08/2022",
    status: "Inativo",
    avaliacao: 4.0,
    observacao: "Profissional competente. Saiu para assumir cargo em outra empresa.",
    motivoDemissao: "Saída voluntária - Proposta melhor",
  },
  {
    id: 7,
    nome: "Juliana Martins",
    cargo: "Designer de Interiores",
    departamento: "Design",
    dataContratacao: "03/02/2019",
    dataDemissao: "20/11/2021",
    status: "Inativo",
    avaliacao: 3.5,
    observacao: "Boa profissional, criativa. Saiu para abrir seu próprio escritório.",
    motivoDemissao: "Saída voluntária - Empreendimento próprio",
  },
  {
    id: 8,
    nome: "Fernando Gomes",
    cargo: "Auxiliar de Obras",
    departamento: "Construção",
    dataContratacao: "12/07/2020",
    dataDemissao: "05/03/2022",
    status: "Inativo",
    avaliacao: 2.0,
    observacao: "Apresentou problemas de pontualidade e comprometimento.",
    motivoDemissao: "Demissão por desempenho insatisfatório",
  },
  {
    id: 9,
    nome: "Luciana Soares",
    cargo: "Assistente Administrativo",
    departamento: "Administração",
    dataContratacao: "08/03/2017",
    dataDemissao: "30/06/2023",
    status: "Inativo",
    avaliacao: 4.5,
    observacao: "Excelente profissional. Saiu por motivos pessoais (mudança de cidade).",
    motivoDemissao: "Saída voluntária - Motivos pessoais",
  },
  {
    id: 10,
    nome: "Ricardo Mendes",
    cargo: "Técnico em Edificações",
    departamento: "Projetos",
    dataContratacao: "15/09/2019",
    dataDemissao: "10/12/2022",
    status: "Inativo",
    avaliacao: 3.0,
    observacao: "Profissional com conhecimento técnico, mas com dificuldades de relacionamento com a equipe.",
    motivoDemissao: "Acordo mútuo",
  },
]

// Combinando todos os funcionários
const todosFuncionarios = [...funcionariosAtivos, ...exFuncionarios]

// Departamentos disponíveis para filtro
const departamentos = ["Projetos", "Design", "Construção", "Administração", "Segurança"]

// Cargos disponíveis para filtro
const cargos = [
  "Engenheiro Civil",
  "Arquiteta",
  "Mestre de Obras",
  "Gerente de Projetos",
  "Técnico em Segurança",
  "Engenheiro Elétrico",
  "Designer de Interiores",
  "Auxiliar de Obras",
  "Assistente Administrativo",
  "Técnico em Edificações",
]

// Status disponíveis para filtro
const statusOptions = ["Ativo", "Inativo"]

// Motivos de demissão para filtro
const motivosDemissao = [
  "Saída voluntária - Proposta melhor",
  "Saída voluntária - Empreendimento próprio",
  "Saída voluntária - Motivos pessoais",
  "Demissão por desempenho insatisfatório",
  "Acordo mútuo",
]

// Componente para exibir as estrelas de avaliação
function RatingStars({ rating }: { rating: number }) {
  const roundedRating = Math.round(rating * 2) / 2

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= roundedRating) {
          return <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        } else if (star - 0.5 === roundedRating) {
          return (
            <div key={star} className="relative h-4 w-4">
              <Star className="absolute h-4 w-4 text-yellow-400" />
              <div className="absolute h-4 w-2 overflow-hidden">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )
        } else {
          return <Star key={star} className="h-4 w-4 text-yellow-400" />
        }
      })}
      <span className="ml-1 text-sm text-gray-600">{roundedRating.toFixed(1)}</span>
    </div>
  )
}

export default function HistoricoFuncionariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string[]>([])
  const [filtroCargo, setFiltroCargo] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [filtroMotivoDemissao, setFiltroMotivoDemissao] = useState<string[]>([])
  const [dateRangeContratacao, setDateRangeContratacao] = useState<DateRange | undefined>(undefined)
  const [dateRangeDemissao, setDateRangeDemissao] = useState<DateRange | undefined>(undefined)
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<number[]>([])
  const [dialogReplicacaoAberto, setDialogReplicacaoAberto] = useState(false)
  const [proximaQuinzena, setProximaQuinzena] = useState("")

  const hoje = new Date()
  const diaAtual = hoje.getDate()
  const ehPrimeiraQuinzena = diaAtual <= 15

  const proximaQuinzenaTexto = ehPrimeiraQuinzena
    ? `Segunda quinzena de ${format(hoje, "MMMM/yyyy", { locale: ptBR })}`
    : `Primeira quinzena de ${format(addMonths(hoje, 1), "MMMM/yyyy", { locale: ptBR })}`

  const todosFuncionariosFiltrados = todosFuncionarios.filter((funcionario) => {
    const matchesSearch =
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.departamento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartamento = filtroDepartamento.length === 0 || filtroDepartamento.includes(funcionario.departamento)
    const matchesCargo = filtroCargo.length === 0 || filtroCargo.includes(funcionario.cargo)
    const matchesStatus = filtroStatus.length === 0 || filtroStatus.includes(funcionario.status)

    const matchesMotivoDemissao =
      filtroMotivoDemissao.length === 0 ||
      (funcionario.status === "Inativo" &&
        "motivoDemissao" in funcionario &&
        filtroMotivoDemissao.includes((funcionario as any).motivoDemissao as string))

    let matchesDataContratacao = true
    if (dateRangeContratacao?.from) {
      const dataContratacao = parseISO(funcionario.dataContratacao.split("/").reverse().join("-"))

      if (dateRangeContratacao.to) {
        matchesDataContratacao = isWithinInterval(dataContratacao, {
          start: dateRangeContratacao.from,
          end: dateRangeContratacao.to,
        })
      } else {
        matchesDataContratacao =
          format(dataContratacao, "yyyy-MM-dd") === format(dateRangeContratacao.from, "yyyy-MM-dd")
      }
    }

    let matchesDataDemissao = true
    if (dateRangeDemissao?.from && funcionario.dataDemissao) {
      const dataDemissao = parseISO(funcionario.dataDemissao.split("/").reverse().join("-"))

      if (dateRangeDemissao.to) {
        matchesDataDemissao = isWithinInterval(dataDemissao, {
          start: dateRangeDemissao.from,
          end: dateRangeDemissao.to,
        })
      } else {
        matchesDataDemissao = format(dataDemissao, "yyyy-MM-dd") === format(dateRangeDemissao.from, "yyyy-MM-dd")
      }
    }

    return (
      matchesSearch &&
      matchesDepartamento &&
      matchesCargo &&
      matchesStatus &&
      matchesMotivoDemissao &&
      matchesDataContratacao &&
      matchesDataDemissao
    )
  })

  const toggleDepartamento = (departamento: string) => {
    setFiltroDepartamento((current) => {
      if (current.includes(departamento)) {
        return current.filter((d) => d !== departamento)
      } else {
        return [...current, departamento]
      }
    })
  }

  const toggleCargo = (cargo: string) => {
    setFiltroCargo((current) => {
      if (current.includes(cargo)) {
        return current.filter((c) => c !== cargo)
      } else {
        return [...current, cargo]
      }
    })
  }

  const toggleStatus = (status: string) => {
    setFiltroStatus((current) => {
      if (current.includes(status)) {
        return current.filter((s) => s !== status)
      } else {
        return [...current, status]
      }
    })
  }

  const toggleMotivoDemissao = (motivo: string) => {
    setFiltroMotivoDemissao((current) => {
      if (current.includes(motivo)) {
        return current.filter((m) => m !== motivo)
      } else {
        return [...current, motivo]
      }
    })
  }

  const limparFiltros = () => {
    setFiltroDepartamento([])
    setFiltroCargo([])
    setFiltroStatus([])
    setFiltroMotivoDemissao([])
    setSearchTerm("")
    setDateRangeContratacao(undefined)
    setDateRangeDemissao(undefined)
  }

  const toggleSelectAll = () => {
    if (selectedFuncionarios.length === todosFuncionariosFiltrados.length) {
      setSelectedFuncionarios([])
    } else {
      setSelectedFuncionarios(todosFuncionariosFiltrados.map((f) => f.id))
    }
  }

  const toggleSelectFuncionario = (id: number) => {
    setSelectedFuncionarios((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fId) => fId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const abrirDialogoReplicacao = () => {
    if (selectedFuncionarios.length === 0) {
      toast({
        title: "Nenhum funcionário selecionado",
        description: "Selecione pelo menos um funcionário para replicar para a próxima quinzena.",
        variant: "destructive",
      })
      return
    }

    const funcionariosInativos = selectedFuncionarios.filter(
      (id) => todosFuncionarios.find((f) => f.id === id)?.status === "Inativo",
    )

    if (funcionariosInativos.length > 0) {
      toast({
        title: "Funcionários inativos selecionados",
        description: "Não é possível replicar funcionários inativos para a próxima quinzena.",
        variant: "destructive",
      })
      return
    }

    setProximaQuinzena(proximaQuinzenaTexto)
    setDialogReplicacaoAberto(true)
  }

  const replicarFuncionarios = () => {
    setDialogReplicacaoAberto(false)

    toast({
      title: "Funcionários Replicados",
      description: `${selectedFuncionarios.length} funcionário(s) replicado(s) com sucesso para a ${proximaQuinzena}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    setSelectedFuncionarios([])
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/funcionarios">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de Funcionários</h2>
        </div>
        <div className="flex w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={abrirDialogoReplicacao}
            disabled={selectedFuncionarios.length === 0}
            className="whitespace-nowrap w-full"
          >
            <CopyPlus className="mr-2 h-4 w-4" />
            Replicar para Próxima Quinzena
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
        <div>
          <h3 className="text-lg font-medium">Todos os Funcionários</h3>
          <p className="text-sm text-muted-foreground">Visualize todos os funcionários ativos e inativos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <DateRangePicker
            value={dateRangeContratacao}
            onChange={setDateRangeContratacao}
            placeholder="Contratação"
            align="end"
            locale={ptBR}
          />
          <DateRangePicker
            value={dateRangeDemissao}
            onChange={setDateRangeDemissao}
            placeholder="Demissão"
            align="end"
            locale={ptBR}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
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
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Motivo de Demissão</h5>
                <div className="space-y-2">
                  {motivosDemissao.map((motivo) => (
                    <div key={motivo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`motivo-${motivo}`}
                        checked={filtroMotivoDemissao.includes(motivo)}
                        onCheckedChange={() => toggleMotivoDemissao(motivo)}
                      />
                      <label
                        htmlFor={`motivo-${motivo}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {motivo}
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
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      todosFuncionariosFiltrados.length > 0 &&
                      selectedFuncionarios.length === todosFuncionariosFiltrados.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead className="min-w-[120px]">Nome</TableHead>
                <TableHead className="min-w-[120px]">Cargo</TableHead>
                <TableHead className="min-w-[120px]">Departamento</TableHead>
                <TableHead className="min-w-[140px]">Data de Contratação</TableHead>
                <TableHead className="min-w-[140px]">Data de Demissão</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Avaliação</TableHead>
                <TableHead className="min-w-[150px]">Motivo de Saída</TableHead>
                <TableHead className="text-right min-w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todosFuncionariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                todosFuncionariosFiltrados.map((funcionario) => (
                  <TableRow
                    key={funcionario.id}
                    className={selectedFuncionarios.includes(funcionario.id) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedFuncionarios.includes(funcionario.id)}
                        onCheckedChange={() => toggleSelectFuncionario(funcionario.id)}
                        aria-label={`Selecionar ${funcionario.nome}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{funcionario.nome}</TableCell>
                    <TableCell>{funcionario.cargo}</TableCell>
                    <TableCell>{funcionario.departamento}</TableCell>
                    <TableCell>{funcionario.dataContratacao}</TableCell>
                    <TableCell>
                      {funcionario.dataDemissao || <span className="text-muted-foreground italic">Não aplicável</span>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={funcionario.status === "Ativo" ? "default" : "secondary"}
                        className={funcionario.status === "Ativo" ? "bg-green-500" : "bg-gray-500"}
                      >
                        {funcionario.status}
                      </Badge>
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
                      {funcionario.status === "Inativo" && "motivoDemissao" in funcionario ? (
                        <span>{(funcionario as any).motivoDemissao}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Não aplicável</span>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/funcionarios/${funcionario.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
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

      {/* Diálogo de Replicação */}
      <Dialog open={dialogReplicacaoAberto} onOpenChange={setDialogReplicacaoAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Replicar para Próxima Quinzena</DialogTitle>
            <DialogDescription>
              Os funcionários selecionados serão replicados para a próxima quinzena com os mesmos valores.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium">Funcionários Selecionados</h4>
              <p>{selectedFuncionarios.length} funcionário(s)</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Próxima Quinzena</h4>
              <p>{proximaQuinzenaTexto}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Funcionários a serem replicados</h4>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {selectedFuncionarios.map((id) => {
                  const funcionario = todosFuncionarios.find((f) => f.id === id)
                  return funcionario?.status === "Ativo" ? (
                    <li key={id} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {funcionario.nome}
                    </li>
                  ) : null
                })}
              </ul>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogReplicacaoAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={replicarFuncionarios} className="w-full sm:w-auto">
              Confirmar Replicação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
