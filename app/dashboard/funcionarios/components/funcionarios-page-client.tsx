"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
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
  Copy,
  Filter,
  ChevronDown,
  Star,
  CreditCard,
  History,
  Download,
  FileText,
  Upload,
  CalendarDays,
  DollarSign,
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
import { LogoutButton } from "@/components/logout-button"
import { NumericFormat } from "react-number-format"
import { useActionState } from "react"
import {
  handleFuncionarioApontamentoSubmit,
  type FuncionarioApontamento,
} from "@/app/actions/funcionario"
import { aplicarMascaraMonetaria } from "@/app/lib/masks"
import { getContasBancarias, pagarApontamentosQuinzena } from "@/app/actions/apontamentos"
import { getObrasList, ObraListItem } from "@/app/actions/obra"

// Histórico de pagamentos (mantidos para demonstração, pois o novo endpoint não cobre todos os detalhes)
const historicoPagamentos = [
  {
    id: 1,
    funcionarioId: "1", // Alterado para string para compatibilidade
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
    funcionarioId: "1",
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
    funcionarioId: "1",
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
    funcionarioId: "2",
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
    funcionarioId: "2",
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
    funcionarioId: "3",
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
    funcionarioId: "4",
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
    funcionarioId: "5",
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

// Departamentos disponíveis para filtro
const departamentos = ["Projetos", "Design", "Construção", "Administração", "Segurança"]

// Cargos disponíveis para filtro
const cargos = ["Engenheiro Civil", "Arquiteta", "Mestre de Obras", "Gerente de Projetos", "Técnico em Segurança"]

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

// Client Component to handle state and interactions
export function FuncionariosPageClient({ initialFuncionarios }: { initialFuncionarios: FuncionarioApontamento[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string[]>([])
  const [filtroCargo, setFiltroCargo] = useState<string[]>([])
  const [dialogPagamentoAberto, setDialogPagamentoAberto] = useState(false)
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<FuncionarioApontamento | null>(null)
  const [contaSelecionada, setContaSelecionada] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<string[]>([])
  const [dialogPagamentoQuinzenaAberto, setDialogPagamentoQuinzenaAberto] = useState(false)
  const [contasBancarias, setContasBancarias] = useState<
    { id: string; nome: string; agencia: string; conta: string }[]
  >([])
  const [contaSelecionadaQuinzena, setContaSelecionadaQuinzena] = useState("")
  const [isPaying, setIsPaying] = useState(false)

  // Novos estados para o diálogo de apontamento
  const [dialogApontamentoAberto, setDialogApontamentoAberto] = useState(false)
  const [apontamentoFuncionario, setApontamentoFuncionario] = useState<FuncionarioApontamento | null>(null)
  const [obrasDisponiveis, setObrasDisponiveis] = useState<ObraListItem[]>([])
  const [apontamentoFormData, setApontamentoFormData] = useState({
    funcionarioId: "",
    apontamentoId: "", // Adicionado para edição
    diaria: 0,
    diasTrabalhados: 0,
    valorAdicional: 0,
    descontos: 0,
    adiantamento: 0,
    periodoInicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    periodoFim: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    obraId: "",
  })

  // State para a Server Action de pagamento
  const [paymentState, paymentAction] = useActionState(handleFuncionarioApontamentoSubmit, {
    success: false,
    message: "",
  })

  // Novo estado para controlar a submissão do formulário
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  useEffect(() => {
    if (paymentState.success) {
      toast({
        title: "Sucesso!",
        description: paymentState.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
      setDialogApontamentoAberto(false)
    } else if (paymentState.message) {
      toast({
        title: "Erro",
        description: paymentState.message,
        variant: "destructive",
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
    }
    setIsSubmittingForm(false) // Resetar o flag de submissão após a ação
  }, [paymentState])

  // Carregar obras ao abrir o diálogo de apontamento
  useEffect(() => {
    if (dialogApontamentoAberto) {
      const fetchObras = async () => {
        const result = await getObrasList()
        if ("error" in result) {
          toast({
            title: "Erro ao carregar obras",
            description: result.error,
            variant: "destructive",
          })
          setObrasDisponiveis([])
        } else {
          setObrasDisponiveis(result)
        }
      }
      fetchObras()
    }
  }, [dialogApontamentoAberto])

  // Carregar contas bancárias ao abrir o diálogo de pagamento da quinzena
  useEffect(() => {
    if (dialogPagamentoQuinzenaAberto) {
      const fetchContas = async () => {
        const result = await getContasBancarias()
        if ("error" in result) {
          toast({
            title: "Erro ao carregar contas bancárias",
            description: result.error,
            variant: "destructive",
          })
          setContasBancarias([])
        } else {
          setContasBancarias(result)
        }
      }
      fetchContas()
    }
  }, [dialogPagamentoQuinzenaAberto])

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

  const valorTotalQuinzena = initialFuncionarios.reduce((total, funcionario) => {
    const valorFuncionario =
      funcionario.valorDiaria * funcionario.diasTrabalhados +
      funcionario.valorAdicional -
      funcionario.descontos -
      funcionario.adiantamento
    return total + valorFuncionario
  }, 0)

  const funcionariosApontamentosFiltrados = initialFuncionarios.filter((funcionario) => {
    const matchesSearch =
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.departamento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartamento = filtroDepartamento.length === 0 || filtroDepartamento.includes(funcionario.departamento)
    const matchesCargo = filtroCargo.length === 0 || filtroCargo.includes(funcionario.cargo)

    return matchesSearch && matchesDepartamento && matchesCargo
  })

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

  const copiarChavePix = (chavePix: string) => {
    navigator.clipboard.writeText(chavePix)
    toast({
      title: "Chave PIX copiada",
      description: "A chave PIX foi copiada para a área de transferência.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  const abrirDialogoPagamento = (funcionario: FuncionarioApontamento) => {
    setFuncionarioSelecionado(funcionario)
    setContaSelecionada("")
    setDialogPagamentoAberto(true)
  }

  const processarPagamento = () => {
    if (!funcionarioSelecionado || !contaSelecionada) return

    const valorTotal =
      funcionarioSelecionado.valorDiaria * funcionarioSelecionado.diasTrabalhados +
      funcionarioSelecionado.valorAdicional -
      funcionarioSelecionado.descontos -
      funcionarioSelecionado.adiantamento

    setDialogPagamentoAberto(false)

    toast({
      title: "Pagamento Processado",
      description: `Pagamento de R$ ${valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para ${funcionarioSelecionado.nome} foi processado com sucesso pela conta ${contaSelecionada}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

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

  const limparFiltros = () => {
    setFiltroDepartamento([])
    setFiltroCargo([])
    setSearchTerm("")
  }

  const exportarComprovante = (comprovante: string) => {
    toast({
      title: "Comprovante Exportado",
      description: `O comprovante ${comprovante} foi exportado com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  const toggleSelectAll = () => {
    if (selectedFuncionarios.length === funcionariosApontamentosFiltrados.length) {
      setSelectedFuncionarios([])
    } else {
      setSelectedFuncionarios(funcionariosApontamentosFiltrados.map((f) => f.id))
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

  const abrirDialogoPagamentoQuinzena = () => {
    if (selectedFuncionarios.length === 0) {
      toast({
        title: "Nenhum funcionário selecionado",
        description: "Selecione pelo menos um funcionário para processar o pagamento da quinzena.",
        variant: "destructive",
      })
      return
    }

    // Verificar se todos os funcionários selecionados têm apontamentos em aberto
    const funcionariosComApontamento = selectedFuncionarios.filter((id) => {
      const funcionario = initialFuncionarios.find((f) => f.id === id)
      return funcionario?.apontamentoId && funcionario?.statusApontamento === "EM_ABERTO"
    })

    if (funcionariosComApontamento.length === 0) {
      toast({
        title: "Nenhum apontamento em aberto",
        description: "Os funcionários selecionados não possuem apontamentos em aberto para pagamento.",
        variant: "destructive",
      })
      return
    }

    if (funcionariosComApontamento.length !== selectedFuncionarios.length) {
      toast({
        title: "Alguns funcionários não têm apontamentos",
        description: "Apenas funcionários com apontamentos em aberto serão processados para pagamento.",
        variant: "default",
      })
    }

    setDialogPagamentoQuinzenaAberto(true)
  }

  const processarPagamentoQuinzena = async () => {
    if (!contaSelecionadaQuinzena) {
      toast({
        title: "Conta bancária obrigatória",
        description: "Selecione uma conta bancária para processar os pagamentos.",
        variant: "destructive",
      })
      return
    }

    setIsPaying(true)
    setDialogPagamentoQuinzenaAberto(false)

    try {
      // Filtrar apenas funcionários com apontamentos em aberto
      const apontamentosParaPagar = selectedFuncionarios
        .map((id) => {
          const funcionario = initialFuncionarios.find((f) => f.id === id)
          return funcionario?.apontamentoId && funcionario?.statusApontamento === "EM_ABERTO"
            ? funcionario.apontamentoId
            : null
        })
        .filter((id): id is string => id !== null)

      const result = await pagarApontamentosQuinzena(apontamentosParaPagar, contaSelecionadaQuinzena)

      if (result.success) {
        const { resumo, sucessos, falhas } = result

        let mensagem = `Pagamento da quinzena concluído!\n`
        if (resumo) {
          mensagem += `Total processado: ${resumo.totalSolicitado}\n`
          mensagem += `Sucessos: ${resumo.totalSucesso}\n`
          mensagem += `Falhas: ${resumo.totalFalha}`
        } else {
          mensagem += "Resumo de pagamento indisponível."
        }

        if (falhas && falhas.length > 0) {
          mensagem += `\n\nFalhas encontradas:`
          falhas.forEach((falha: any) => {
            const funcionario = initialFuncionarios.find((f) => f.apontamentoId === falha.apontamentoId)
            mensagem += `\n• ${funcionario?.nome || "Funcionário"}: ${falha.motivo}`
          })
        }

        toast({
          title: resumo && resumo.totalFalha > 0 ? "Pagamento com avisos" : "Sucesso!",
          description: mensagem,
          variant: resumo && resumo.totalFalha > 0 ? "destructive" : "default",
          action: <ToastAction altText="Fechar">Fechar</ToastAction>,
        })

        // Limpar seleção se houve pelo menos um sucesso
        if (resumo && resumo.totalSucesso > 0) {
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
        description: "Erro inesperado ao processar pagamentos. Tente novamente.",
        variant: "destructive",
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
    } finally {
      setIsPaying(false)
      setContaSelecionadaQuinzena("")
    }
  }

  // Funções para o novo diálogo de apontamento
  const abrirDialogoApontamento = (funcionario: FuncionarioApontamento) => {
    setApontamentoFuncionario(funcionario)
    // Preencher com valores do apontamento existente ou valores padrão
    setApontamentoFormData({
      funcionarioId: funcionario.id,
      apontamentoId: funcionario.apontamentoId || "", // Passa o ID do apontamento se existir
      diaria: funcionario.valorDiaria,
      diasTrabalhados: funcionario.diasTrabalhados,
      valorAdicional: funcionario.valorAdicional,
      descontos: funcionario.descontos,
      adiantamento: funcionario.adiantamento,
      // Use o período existente se o apontamentoId existir, caso contrário, use o mês atual
      periodoInicio:
        funcionario.apontamentoId && funcionario.periodoInicio
          ? funcionario.periodoInicio
          : format(startOfMonth(new Date()), "yyyy-MM-dd"),
      periodoFim:
        funcionario.apontamentoId && funcionario.periodoFim
          ? funcionario.periodoFim
          : format(endOfMonth(new Date()), "yyyy-MM-dd"),
      obraId: funcionario.apontamentoId && funcionario.obraId ? funcionario.obraId : "", // Use a obra existente ou limpe
    })

    console.log("Abrindo diálogo de apontamento para:", funcionario)
    setDialogApontamentoAberto(true)
  }

  const handleApontamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApontamentoFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApontamentoNumericChange = (name: string, floatValue: number | undefined) => {
    setApontamentoFormData((prev) => ({
      ...prev,
      [name]: floatValue === undefined ? 0 : floatValue,
    }))
  }

  const handleApontamentoSelectChange = (name: string, value: string) => {
    setApontamentoFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitApontamento = (formData: FormData) => {
    if (!apontamentoFuncionario || isSubmittingForm) return // Prevenir múltiplas submissões

    setIsSubmittingForm(true) // Definir o flag de submissão

    // Adicionar o ID do funcionário e o ID do apontamento (se existir) ao FormData
    formData.append("funcionarioId", apontamentoFuncionario.id)
    if (apontamentoFuncionario.apontamentoId) {
      formData.append("apontamentoId", apontamentoFuncionario.apontamentoId)
    }

    // Calcular valor total antes de enviar (se necessário para o backend)
    const diaria = Number.parseFloat((formData.get("diaria") as string) || "0")
    const diasTrabalhados = Number.parseInt((formData.get("diasTrabalhados") as string) || "0")
    const valorAdicional = Number.parseFloat((formData.get("valorAdicional") as string) || "0")
    const descontos = Number.parseFloat((formData.get("descontos") as string) || "0")
    const adiantamento = Number.parseFloat((formData.get("adiantamento") as string) || "0")
    const valorTotalCalculado = diaria * diasTrabalhados + valorAdicional - descontos - adiantamento
    formData.append("valorTotal", valorTotalCalculado.toString())

    paymentAction(formData)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Funcionários</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/funcionarios/historico">
              <History className="mr-2 h-4 w-4" />
              Histórico Completo
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/funcionarios/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      <Tabs defaultValue="quinzena">
        <TabsList className="mb-4 grid w-full grid-cols-2 md:w-auto">
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
            <div className="text-left md:text-right w-full md:w-auto">
              <p className="text-sm text-muted-foreground">Valor Total da Quinzena</p>
              <p className="text-2xl font-bold">
                R$ {valorTotalQuinzena.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 justify-between">
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
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={abrirDialogoPagamentoQuinzena}
                disabled={selectedFuncionarios.length === 0 || isPaying}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {isPaying ? "Processando..." : "Pagar Quinzena"}
              </Button>
              <Popover open={filtroAberto} onOpenChange={setFiltroAberto}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
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
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          funcionariosApontamentosFiltrados.length > 0 &&
                          selectedFuncionarios.length === funcionariosApontamentosFiltrados.length
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="min-w-[120px]">Data de Contratação</TableHead>
                    <TableHead className="min-w-[100px]">Diária (R$)</TableHead>
                    <TableHead className="min-w-[120px]">Dias Trabalhados</TableHead>
                    <TableHead className="min-w-[140px]">Valor Adicional (R$)</TableHead>
                    <TableHead className="min-w-[100px]">Descontos (R$)</TableHead>
                    <TableHead className="min-w-[120px]">Adiantamento (R$)</TableHead>
                    <TableHead className="min-w-[120px]">Chave PIX</TableHead>
                    <TableHead className="min-w-[100px]">Avaliação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosApontamentosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="h-24 text-center">
                        Nenhum funcionário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    funcionariosApontamentosFiltrados.map((funcionario) => (
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
                        <TableCell>{funcionario.dataContratacao.split("T")[0]}</TableCell>
                        <TableCell>{aplicarMascaraMonetaria(funcionario.valorDiaria)}</TableCell>
                        <TableCell>{funcionario.diasTrabalhados}</TableCell>
                        <TableCell>{aplicarMascaraMonetaria(funcionario.valorAdicional)}</TableCell>
                        <TableCell>{aplicarMascaraMonetaria(funcionario.descontos)}</TableCell>
                        <TableCell>{aplicarMascaraMonetaria(funcionario.adiantamento)}</TableCell>
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
                                  <RatingStars rating={Number(funcionario.avaliacaoDesempenho) || 0} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{funcionario.observacoes || "Nenhuma observação."}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full mr-2 ${
                                funcionario.apontamentoId === null
                                  ? "bg-gray-500" // Cor para SEM_APONTAMENTO
                                  : funcionario.statusApontamento === "EM_ABERTO"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            />
                            {funcionario.apontamentoId === null ? "SEM_APONTAMENTO" : funcionario.statusApontamento}
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
                              <DropdownMenuItem onClick={() => abrirDialogoPagamento(funcionario)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pagar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => abrirDialogoApontamento(funcionario)}>
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {funcionario.apontamentoId === null ? "Criar Apontamento" : "Editar Apontamento"}
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
            <div className="w-full md:w-auto">
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
                    <TableHead className="min-w-[120px]">Dias Trabalhados</TableHead>
                    <TableHead className="min-w-[140px]">Valor Adicional (R$)</TableHead>
                    <TableHead className="min-w-[100px]">Descontos (R$)</TableHead>
                    <TableHead className="min-w-[120px]">Adiantamento (R$)</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead className="min-w-[120px]">Valor Total (R$)</TableHead>
                    <TableHead className="min-w-[120px]">Comprovante</TableHead>
                    <TableHead className="text-right min-w-[80px]">Ações</TableHead>
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
                      // Encontra o funcionário correspondente na lista de apontamentos
                      const funcionario = initialFuncionarios.find((f) => f.id === pagamento.funcionarioId)
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

      {/* Diálogo de Pagamento Individual (existente) */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Diária</h4>
                    <p>R$ {funcionarioSelecionado.valorDiaria.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
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
                        funcionarioSelecionado.valorDiaria * funcionarioSelecionado.diasTrabalhados +
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input id="comprovante-pagamento" type="file" className="flex-1" />
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogPagamentoAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={processarPagamento} disabled={!contaSelecionada} className="w-full sm:w-auto">
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Novo Diálogo de Pagamento da Quinzena */}
      <Dialog open={dialogPagamentoQuinzenaAberto} onOpenChange={setDialogPagamentoQuinzenaAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pagar Quinzena</DialogTitle>
            <DialogDescription>
              Processar pagamentos dos funcionários selecionados que possuem apontamentos em aberto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium">Funcionários Selecionados</h4>
              <p>{selectedFuncionarios.length} funcionário(s)</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Funcionários com apontamentos em aberto</h4>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {selectedFuncionarios.map((id) => {
                  const funcionario = initialFuncionarios.find((f) => f.id === id)
                  if (funcionario?.apontamentoId && funcionario?.statusApontamento === "EM_ABERTO") {
                    const valorTotal =
                      funcionario.valorDiaria * funcionario.diasTrabalhados +
                      funcionario.valorAdicional -
                      funcionario.descontos -
                      funcionario.adiantamento
                    return (
                      <li key={id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          {funcionario.nome}
                        </div>
                        <span className="text-xs font-medium">
                          R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </li>
                    )
                  }
                  return null
                })}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conta-quinzena">Conta Bancária</Label>
              <Select value={contaSelecionadaQuinzena} onValueChange={setContaSelecionadaQuinzena}>
                <SelectTrigger id="conta-quinzena">
                  <SelectValue placeholder="Selecione uma conta para os pagamentos" />
                </SelectTrigger>
                <SelectContent>
                  {contasBancarias.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome} (Ag: {conta.agencia}, CC: {conta.conta})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogPagamentoQuinzenaAberto(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={processarPagamentoQuinzena}
              disabled={!contaSelecionadaQuinzena || isPaying}
              className="w-full sm:w-auto"
            >
              {isPaying ? "Processando..." : "Confirmar Pagamentos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição de Apontamento (existente) */}
      <Dialog
        open={dialogApontamentoAberto}
        onOpenChange={(open) => {
          setDialogApontamentoAberto(open)
          if (!open) {
            // Resetar o funcionário selecionado e os dados do formulário ao fechar o diálogo
            setApontamentoFuncionario(null)
            setApontamentoFormData({
              funcionarioId: "",
              apontamentoId: "",
              diaria: 0,
              diasTrabalhados: 0,
              valorAdicional: 0,
              descontos: 0,
              adiantamento: 0,
              periodoInicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
              periodoFim: format(endOfMonth(new Date()), "yyyy-MM-dd"),
              obraId: "",
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Apontamento</DialogTitle>
            <DialogDescription>
              Ajuste os valores de pagamento e vincule a uma obra para {apontamentoFuncionario?.nome}.
            </DialogDescription>
          </DialogHeader>
          {apontamentoFuncionario && (
            <form action={handleSubmitApontamento} className="py-4 space-y-4">
              <input type="hidden" name="funcionarioId" value={apontamentoFuncionario.id} />
              {apontamentoFuncionario.apontamentoId && (
                <input type="hidden" name="apontamentoId" value={apontamentoFuncionario.apontamentoId} />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodoInicio">Período Início</Label>
                  <Input
                    id="periodoInicio"
                    name="periodoInicio"
                    type="date"
                    value={apontamentoFormData.periodoInicio}
                    onChange={handleApontamentoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodoFim">Período Fim</Label>
                  <Input
                    id="periodoFim"
                    name="periodoFim"
                    type="date"
                    value={apontamentoFormData.periodoFim}
                    onChange={handleApontamentoChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diaria">Diária (R$)</Label>
                  <NumericFormat
                    id="diaria"
                    name="diaria"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={apontamentoFormData.diaria}
                    onValueChange={(values) => handleApontamentoNumericChange("diaria", values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diasTrabalhados">Dias Trabalhados</Label>
                  <Input
                    id="diasTrabalhados"
                    name="diasTrabalhados"
                    type="number"
                    value={apontamentoFormData.diasTrabalhados}
                    onChange={handleApontamentoChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorAdicional">Valor Adicional (R$)</Label>
                  <NumericFormat
                    id="valorAdicional"
                    name="valorAdicional"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={apontamentoFormData.valorAdicional}
                    onValueChange={(values) => handleApontamentoNumericChange("valorAdicional", values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descontos">Descontos (R$)</Label>
                  <NumericFormat
                    id="descontos"
                    name="descontos"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={apontamentoFormData.descontos}
                    onValueChange={(values) => handleApontamentoNumericChange("descontos", values.floatValue)}
                    customInput={Input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adiantamento">Adiantamento (R$)</Label>
                  <NumericFormat
                    id="adiantamento"
                    name="adiantamento"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={apontamentoFormData.adiantamento}
                    onValueChange={(values) => handleApontamentoNumericChange("adiantamento", values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obraId">Vincular à Obra</Label>
                  <Select
                    name="obraId"
                    value={apontamentoFormData.obraId}
                    onValueChange={(value) => handleApontamentoSelectChange("obraId", value)}
                  >
                    <SelectTrigger id="obraId">
                      <SelectValue placeholder="Selecione uma obra (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nenhuma Obra">Nenhuma Obra</SelectItem>
                      {obrasDisponiveis.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id.toString()}>
                          {obra.nome} ({obra.cliente})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogApontamentoAberto(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmittingForm}>
                  {isSubmittingForm ? "Salvando..." : "Salvar Apontamento"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
