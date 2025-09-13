"use client"

import { useState } from "react"
import Link from "next/link"
import type { FuncionariosResponse } from "@/types/funcionario"

// Tipo baseado na resposta real do backend
type FuncionarioHistorico = {
  id: string
  nome: string
  cpf?: string
  telefone?: string
  cargo?: string
  departamento?: string
  dataContratacao?: string
  valorDiaria?: number
  chavePix?: string
  status: string
  created_at?: string
  updated_at?: string
  diaria?: number
}
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useRouter, useSearchParams } from "next/navigation"
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
// Removed unused FuncionarioBase import
import { deleteFuncionario, AtivarFuncionario } from "@/app/actions/funcionario" // Importar a nova Server Action
import { replicarFuncionariosQuinzena } from "@/app/actions/apontamentos"

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
  initialData,
}: {
  initialData: { dados: FuncionarioHistorico[], paginacao: { totalItens: number, totalPages: number, currentPage: number, pageSize: number } }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Extract funcionarios from paginated data
  const initialFuncionarios = initialData.dados || []
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(initialData.paginacao?.currentPage || 1)
  const [pageSize, setPageSize] = useState(initialData.paginacao?.pageSize || 20)
  
  const [dialogExclusaoAberto, setDialogExclusaoAberto] = useState(false)
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<FuncionarioHistorico | null>(null)

  const [dialogAtivacaoAberto, setDialogAtivacaoAberto] = useState(false) // Novo estado para o diálogo de ativação
  const [funcionarioParaAtivar, setFuncionarioParaAtivar] = useState<FuncionarioHistorico | null>(null) // Novo estado para o funcionário a ativar

  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string[]>([])
  const [filtroCargo, setFiltroCargo] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [filtroMotivoDemissao, setFiltroMotivoDemissao] = useState<string[]>([])
  const [dateRangeContratacao, setDateRangeContratacao] = useState<DateRange | undefined>(undefined)
  const [dateRangeDemissao, setDateRangeDemissao] = useState<DateRange | undefined>(undefined)
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<string[]>([]) // Alterado para string
  const [dialogReplicacaoAberto, setDialogReplicacaoAberto] = useState(false)
  const [proximaQuinzena, setProximaQuinzena] = useState("")
  const [isReplicating, setIsReplicating] = useState(false)

  const hoje = new Date()
  const diaAtual = hoje.getDate()
  const ehPrimeiraQuinzena = diaAtual <= 15

  const proximaQuinzenaTexto = ehPrimeiraQuinzena
    ? `Segunda quinzena de ${format(hoje, "MMMM/yyyy", { locale: ptBR })}`
    : `Primeira quinzena de ${format(addMonths(hoje, 1), "MMMM/yyyy", { locale: ptBR })}`

  // Funções para controlar paginação (lado cliente)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Primeiro filtrar os dados
  const funcionariosFiltrados = (Array.isArray(initialFuncionarios) ? initialFuncionarios : []).filter((funcionario) => {
    const matchesSearch =
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.cargo && funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (funcionario.departamento && funcionario.departamento.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDepartamento =
      filtroDepartamento.length === 0 ||
      (funcionario.departamento && filtroDepartamento.includes(funcionario.departamento))
    const matchesCargo = filtroCargo.length === 0 || (funcionario.cargo && filtroCargo.includes(funcionario.cargo))
    const matchesStatus = filtroStatus.length === 0 || (funcionario.status && filtroStatus.includes(funcionario.status))

    const matchesMotivoDemissao =
      filtroMotivoDemissao.length === 0 ||
      (funcionario.status === "Inativo" &&
        funcionario.motivoDesligamento && // Alterado de motivoDesligamento para motivoDemissao
        filtroMotivoDemissao.includes(funcionario.motivoDesligamento)) // Alterado de motivoDesligamento para motivoDemissao

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
      matchesMotivoDemissao &&
      matchesDataContratacao &&
      matchesDataDemissao
    )
  })

  // Aplicar paginação do lado cliente
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const todosFuncionariosFiltrados = funcionariosFiltrados.slice(startIndex, endIndex)
  
  // Atualizar paginação baseada nos dados filtrados
  const totalFiltrados = funcionariosFiltrados.length
  const totalPagesFiltrados = Math.ceil(totalFiltrados / pageSize)

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
      (id) => (Array.isArray(initialFuncionarios) ? initialFuncionarios : []).find((f) => f.id === id)?.status === "Inativo",
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

  const replicarFuncionarios = async () => {
    if (selectedFuncionarios.length === 0) return

    console.log("Replicando funcionários:", selectedFuncionarios)

    setIsReplicating(true)
    setDialogReplicacaoAberto(false)

    try {
      const result = await replicarFuncionariosQuinzena(selectedFuncionarios)
      console.log("Resultado da replicação:", result)
      if (result.success) {
        const { resumo, sucessos, falhas } = result

        // Criar mensagem detalhada baseada nos resultados
        let mensagem = `Replicação concluída!\n`
        mensagem += `Total processado: ${resumo.totalSolicitado}\n`
        mensagem += `Sucessos: ${resumo.totalSucesso}\n`
        mensagem += `Falhas: ${resumo.totalFalha}`

        if (falhas && falhas.length > 0) {
          mensagem += `\n\nFalhas encontradas:`
          falhas.forEach((falha: any) => {
            const funcionario = (Array.isArray(initialFuncionarios) ? initialFuncionarios : []).find((f) => f.id === falha.funcionarioId)
            mensagem += `\n• ${funcionario?.nome || "Funcionário"}: ${falha.motivo}`
          })
        }

        toast({
          title: resumo.totalFalha > 0 ? "Replicação com avisos" : "Sucesso!",
          description: mensagem,
          variant: resumo.totalFalha > 0 ? "destructive" : "default",
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Limpar seleção apenas se houve pelo menos um sucesso
        if (resumo.totalSucesso > 0) {
          setSelectedFuncionarios([])
        }
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao replicar funcionários. Tente novamente.",
        variant: "destructive",
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
    } finally {
      setIsReplicating(false)
    }
  }

  const abrirDialogoExclusao = (funcionario: FuncionarioHistorico) => {
    setFuncionarioParaExcluir(funcionario)
    setDialogExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!funcionarioParaExcluir || !funcionarioParaExcluir.id) {
      toast({
        title: "Erro",
        description: "Funcionário não selecionado para exclusão.",
        variant: "destructive",
      })
      return
    }

    setDialogExclusaoAberto(false) // Fechar o diálogo imediatamente

    const result = await deleteFuncionario(funcionarioParaExcluir.id)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
      // A revalidação na Server Action (funcionario.ts) irá acionar a atualização da lista.
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
    }
    setFuncionarioParaExcluir(null) // Limpar o funcionário selecionado
  }

  const abrirDialogoAtivacao = (funcionario: FuncionarioHistorico) => {
    setFuncionarioParaAtivar(funcionario)
    setDialogAtivacaoAberto(true)
  }

  const confirmarAtivacao = async () => {
    if (!funcionarioParaAtivar || !funcionarioParaAtivar.id) {
      toast({
        title: "Erro",
        description: "Funcionário não selecionado para ativação.",
        variant: "destructive",
      })
      return
    }

    setDialogAtivacaoAberto(false) // Fechar o diálogo imediatamente

    const result = await AtivarFuncionario(funcionarioParaAtivar.id)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
    }
    setFuncionarioParaAtivar(null) // Limpar o funcionário selecionado
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
                    <TableCell>{funcionario.dataContratacao}</TableCell>
                    <TableCell>
                      {funcionario.desligamentoData || <span className="text-muted-foreground italic">Não aplicável</span>}
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
                    <TableCell>
                      {funcionario.status === "Inativo" && funcionario.motivoDesligamento ? (
                        <span>{funcionario.motivoDesligamento}</span>
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
                          {funcionario.status === "Inativo" ? (
                            <DropdownMenuItem onClick={() => abrirDialogoAtivacao(funcionario)}>
                              <CopyPlus className="mr-2 h-4 w-4" />
                              Ativar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => abrirDialogoExclusao(funcionario)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
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
                  const funcionario = (Array.isArray(initialFuncionarios) ? initialFuncionarios : []).find((f) => f.id === id)
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
            <Button onClick={replicarFuncionarios} disabled={isReplicating} className="w-full sm:w-auto">
              {isReplicating ? "Replicando..." : "Confirmar Replicação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Paginação */}
      <DataTablePagination
        totalItems={totalFiltrados}
        totalPages={totalPagesFiltrados}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={dialogExclusaoAberto} onOpenChange={setDialogExclusaoAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o funcionário{" "}
              <span className="font-semibold">{funcionarioParaExcluir?.nome}</span>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogExclusaoAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarExclusao} className="w-full sm:w-auto">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Novo Diálogo de Confirmação de Ativação */}
      <Dialog open={dialogAtivacaoAberto} onOpenChange={setDialogAtivacaoAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Ativação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja ativar o funcionário{" "}
              <span className="font-semibold">{funcionarioParaAtivar?.nome}</span>? Ele voltará a ser considerado ativo
              no sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogAtivacaoAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={confirmarAtivacao} className="w-full sm:w-auto">
              Ativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
