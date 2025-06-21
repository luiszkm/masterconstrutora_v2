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
import { format, isWithinInterval, addMonths } from "date-fns"
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
import type { FuncionarioBase } from "@/app/actions/funcionario" // Importar a Server Action
import { deleteFuncionario, AtivarFuncionario } from "@/app/actions/funcionario" // Importar a nova Server Action
import { formatDateToInput } from "@/app/lib/masks"

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

export default function HistoricoFuncionariosClientPage({
  initialFuncionarios,
}: {
  initialFuncionarios: FuncionarioBase[]
}) {


  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string[]>([])
  const [filtroCargo, setFiltroCargo] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [dateRangeContratacao, setDateRangeContratacao] = useState<DateRange | undefined>(undefined)
  const [dateRangeDemissao, setDateRangeDemissao] = useState<DateRange | undefined>(undefined)
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<string[]>([]) // Alterado para string
  const [proximaQuinzena, setProximaQuinzena] = useState("")

  const hoje = new Date()
  const diaAtual = hoje.getDate()
  const ehPrimeiraQuinzena = diaAtual <= 15

  const proximaQuinzenaTexto = ehPrimeiraQuinzena
    ? `Segunda quinzena de ${format(hoje, "MMMM/yyyy", { locale: ptBR })}`
    : `Primeira quinzena de ${format(addMonths(hoje, 1), "MMMM/yyyy", { locale: ptBR })}`

  const todosFuncionariosFiltrados = initialFuncionarios.filter((funcionario) => {
    const matchesSearch =
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.cargo && funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (funcionario.departamento && funcionario.departamento.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDepartamento =
      filtroDepartamento.length === 0 ||
      (funcionario.departamento && filtroDepartamento.includes(funcionario.departamento))
    const matchesCargo = filtroCargo.length === 0 || (funcionario.cargo && filtroCargo.includes(funcionario.cargo))
    const matchesStatus = filtroStatus.length === 0 || (funcionario.status && filtroStatus.includes(funcionario.status))


    let matchesDataContratacao = true
    if (dateRangeContratacao?.from && funcionario.dataContratacao) {
      const [day, month, year] = funcionario.dataContratacao.split("/")
      const dataContratacao = new Date(Number(year), Number(month) - 1, Number(day))

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
    if (dateRangeDemissao?.from && funcionario.desligamentoData) {
      // Alterado de desligamentoData para dataDemissao
      const [day, month, year] = funcionario.desligamentoData.split("/")
      const dataDemissao = new Date(Number(year), Number(month) - 1, Number(day))

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
    setFiltroDepartamento([])
    setFiltroCargo([])
    setFiltroStatus([])
    setSearchTerm("")
    setDateRangeContratacao(undefined)
    setDateRangeDemissao(undefined)
  }

  const toggleSelectAll = () => {
    if (selectedFuncionarios.length === todosFuncionariosFiltrados.length) {
      setSelectedFuncionarios([])
    } else {
      setSelectedFuncionarios(todosFuncionariosFiltrados.map((f) => f.id as string))
    }
  }

  const toggleSelectFuncionario = (id: string) => {
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
      (id) => initialFuncionarios.find((f) => f.id === id)?.status === "Inativo",
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
                <TableHead className="min-w-[120px]">Diaria</TableHead>
                <TableHead className="min-w-[120px]">Dias Trabalhados</TableHead>
                <TableHead className="min-w-[140px]">Descontos</TableHead>
                <TableHead className="min-w-[140px]">Adicional</TableHead>
                <TableHead className="min-w-[80px]">Adiantamento</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
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
                    className={selectedFuncionarios.includes(funcionario.id as string) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedFuncionarios.includes(funcionario.id as string)}
                        onCheckedChange={() => toggleSelectFuncionario(funcionario.id as string)}
                        aria-label={`Selecionar ${funcionario.nome}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{funcionario.nome}</TableCell>
                    <TableCell>{funcionario.cargo}</TableCell>
                    <TableCell>{funcionario.departamento}</TableCell>
                    <TableCell>{formatDateToInput(funcionario.dataContratacao)}</TableCell>
                    <TableCell>
                      {formatDateToInput(funcionario.desligamentoData) || <span className="text-muted-foreground italic">Não aplicável</span>}
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
                              <RatingStars rating={Number(funcionario.avaliacaoDesempenho) || 0} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{funcionario.observacoes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                   
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
     
    </div>
  )
}
