"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  ChevronDown,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  BanknoteIcon as BankIcon,
  Users,
  Upload,
  Download,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// Dados de exemplo - contas bancárias
const contasBancarias = [
  {
    id: 1,
    nome: "Banco do Brasil - Conta Principal",
    agencia: "1234-5",
    conta: "12345-6",
    tipo: "Conta Corrente",
    saldo: 125000.0,
  },
  {
    id: 2,
    nome: "Itaú - Conta Empresarial",
    agencia: "4321-0",
    conta: "54321-7",
    tipo: "Conta Corrente",
    saldo: 78500.0,
  },
  {
    id: 3,
    nome: "Santander - Conta Pagamentos",
    agencia: "6789-1",
    conta: "67890-2",
    tipo: "Conta Corrente",
    saldo: 45200.0,
  },
  {
    id: 4,
    nome: "Bradesco - Conta Secundária",
    agencia: "9876-5",
    conta: "98765-4",
    tipo: "Conta Corrente",
    saldo: 32100.0,
  },
]

// Dados de exemplo - materiais em orçamento
const materiaisOrcamento = [
  {
    id: 1,
    nome: "Cimento",
    quantidade: 500,
    unidade: "Saco 50kg",
    valorUnitario: 32.5,
    valorTotal: 16250,
    fornecedor: "Materiais Premium Ltda",
  },
  {
    id: 2,
    nome: "Areia",
    quantidade: 120,
    unidade: "m³",
    valorUnitario: 120,
    valorTotal: 14400,
    fornecedor: "Materiais Premium Ltda",
  },
  {
    id: 3,
    nome: "Aço",
    quantidade: 2000,
    unidade: "kg",
    valorUnitario: 8.5,
    valorTotal: 17000,
    fornecedor: "Materiais Premium Ltda",
  },
  {
    id: 4,
    nome: "Mármores",
    quantidade: 80,
    unidade: "m²",
    valorUnitario: 950,
    valorTotal: 76000,
    fornecedor: "Mármores & Granitos SA",
  },
  {
    id: 5,
    nome: "Porcelanatos",
    quantidade: 200,
    unidade: "m²",
    valorUnitario: 89.9,
    valorTotal: 17980,
    fornecedor: "Mármores & Granitos SA",
  },
]

// Dados de exemplo - orçamentos
const orcamentos = [
  {
    id: 1,
    numero: "ORC-2023-001",
    cliente: "Construtora XYZ",
    obra: "Edifício Residencial Aurora",
    dataEmissao: "2023-05-10",
    dataAprovacao: "2023-05-15",
    dataPagamento: "2023-05-20",
    valor: 125000.0,
    status: "Pago",
    formaPagamento: "Transferência Bancária",
    contaBancaria: "Banco do Brasil - Conta Principal",
    materiais: [materiaisOrcamento[0], materiaisOrcamento[1], materiaisOrcamento[2]],
    responsavel: "Maria Oliveira",
    observacoes: "Orçamento para fase inicial da obra. Inclui materiais básicos para fundação e estrutura.",
  },
  {
    id: 2,
    numero: "ORC-2023-002",
    cliente: "Incorporadora ABC",
    obra: "Condomínio Jardim das Flores",
    dataEmissao: "2023-06-05",
    dataAprovacao: "2023-06-12",
    dataPagamento: null,
    valor: 85000.0,
    status: "Aprovado",
    formaPagamento: null,
    contaBancaria: null,
    materiais: [materiaisOrcamento[3], materiaisOrcamento[4]],
    responsavel: "João Silva",
    observacoes: "Orçamento para acabamentos de alto padrão. Cliente solicitou materiais premium.",
  },
  {
    id: 3,
    numero: "ORC-2023-003",
    cliente: "Empreiteira 123",
    obra: "Reforma Comercial Centro",
    dataEmissao: "2023-06-20",
    dataAprovacao: "2023-06-28",
    dataPagamento: "2023-07-05",
    valor: 42500.0,
    status: "Pago",
    formaPagamento: "Boleto Bancário",
    contaBancaria: "Itaú - Conta Empresarial",
    materiais: [materiaisOrcamento[0], materiaisOrcamento[2]],
    responsavel: "Carlos Santos",
    observacoes: "Reforma de espaço comercial no centro. Prazo de entrega ajustado conforme solicitação do cliente.",
  },
  {
    id: 4,
    numero: "ORC-2023-004",
    cliente: "Construtora Horizonte",
    obra: "Residencial Vista Mar",
    dataEmissao: "2023-07-10",
    dataAprovacao: "2023-07-18",
    dataPagamento: null,
    valor: 95000.0,
    status: "Aprovado",
    formaPagamento: null,
    contaBancaria: null,
    materiais: [materiaisOrcamento[1], materiaisOrcamento[3]],
    responsavel: "Ana Pereira",
    observacoes: "Orçamento para segunda fase da obra. Inclui materiais para acabamento externo.",
  },
  {
    id: 5,
    numero: "ORC-2023-005",
    cliente: "Incorporadora Visão",
    obra: "Edifício Comercial Central",
    dataEmissao: "2023-07-25",
    dataAprovacao: "2023-08-02",
    dataPagamento: "2023-08-10",
    valor: 110000.0,
    status: "Pago",
    formaPagamento: "Transferência Bancária",
    contaBancaria: "Santander - Conta Pagamentos",
    materiais: [materiaisOrcamento[2], materiaisOrcamento[4]],
    responsavel: "Pedro Souza",
    observacoes: "Orçamento para instalações elétricas e hidráulicas de alto padrão.",
  },
  {
    id: 6,
    numero: "ORC-2023-006",
    cliente: "Construtora Futuro",
    obra: "Condomínio Parque Verde",
    dataEmissao: "2023-08-15",
    dataAprovacao: "2023-08-22",
    dataPagamento: null,
    valor: 78500.0,
    status: "Aprovado",
    formaPagamento: null,
    contaBancaria: null,
    materiais: [materiaisOrcamento[0], materiaisOrcamento[1], materiaisOrcamento[4]],
    responsavel: "Maria Oliveira",
    observacoes: "Orçamento para área de lazer do condomínio. Inclui materiais para piscina e área gourmet.",
  },
]

// Dados de exemplo - pagamentos de funcionários
const pagamentosFuncionarios = [
  {
    id: 1,
    funcionario: {
      id: 1,
      nome: "João Silva",
      cargo: "Pedreiro",
      avatar: "/confident-leader.png",
    },
    data: "2023-05-15",
    valor: 2800.0,
    tipo: "Salário Quinzenal",
    contaBancaria: "Banco do Brasil - Conta Principal",
    observacao: "Pagamento referente à primeira quinzena de maio",
    status: "Pago",
    comprovante: "comprovante_joao_silva_maio1.pdf",
  },
  {
    id: 2,
    funcionario: {
      id: 2,
      nome: "Maria Oliveira",
      cargo: "Engenheira Civil",
      avatar: "/confident-executive.png",
    },
    data: "2023-05-15",
    valor: 5500.0,
    tipo: "Salário Mensal",
    contaBancaria: "Itaú - Conta Empresarial",
    observacao: "Pagamento referente ao mês de maio",
    status: "Pago",
    comprovante: "comprovante_maria_oliveira_maio.pdf",
  },
  {
    id: 3,
    funcionario: {
      id: 3,
      nome: "Carlos Santos",
      cargo: "Eletricista",
      avatar: null,
    },
    data: "2023-05-15",
    valor: 2200.0,
    tipo: "Salário Quinzenal",
    contaBancaria: "Banco do Brasil - Conta Principal",
    observacao: "Pagamento referente à primeira quinzena de maio",
    status: "Pago",
    comprovante: "comprovante_carlos_santos_maio1.pdf",
  },
  {
    id: 4,
    funcionario: {
      id: 1,
      nome: "João Silva",
      cargo: "Pedreiro",
      avatar: "/confident-leader.png",
    },
    data: "2023-05-30",
    valor: 2800.0,
    tipo: "Salário Quinzenal",
    contaBancaria: "Banco do Brasil - Conta Principal",
    observacao: "Pagamento referente à segunda quinzena de maio",
    status: "Pago",
    comprovante: "comprovante_joao_silva_maio2.pdf",
  },
  {
    id: 5,
    funcionario: {
      id: 3,
      nome: "Carlos Santos",
      cargo: "Eletricista",
      avatar: null,
    },
    data: "2023-05-30",
    valor: 2200.0,
    tipo: "Salário Quinzenal",
    contaBancaria: "Banco do Brasil - Conta Principal",
    observacao: "Pagamento referente à segunda quinzena de maio",
    status: "Pago",
    comprovante: "comprovante_carlos_santos_maio2.pdf",
  },
  {
    id: 6,
    funcionario: {
      id: 4,
      nome: "Ana Pereira",
      cargo: "Arquiteta",
      avatar: null,
    },
    data: "2023-05-30",
    valor: 6000.0,
    tipo: "Salário Mensal",
    contaBancaria: "Santander - Conta Pagamentos",
    observacao: "Pagamento referente ao mês de maio",
    status: "Pago",
    comprovante: "comprovante_ana_pereira_maio.pdf",
  },
  {
    id: 7,
    funcionario: {
      id: 1,
      nome: "João Silva",
      cargo: "Pedreiro",
      avatar: "/confident-leader.png",
    },
    data: "2023-06-15",
    valor: 2800.0,
    tipo: "Salário Quinzenal",
    contaBancaria: null,
    observacao: "Pagamento referente à primeira quinzena de junho",
    status: "Pendente",
    comprovante: null,
  },
  {
    id: 8,
    funcionario: {
      id: 2,
      nome: "Maria Oliveira",
      cargo: "Engenheira Civil",
      avatar: "/confident-executive.png",
    },
    data: "2023-06-15",
    valor: 5500.0,
    tipo: "Salário Mensal",
    contaBancaria: null,
    observacao: "Pagamento referente ao mês de junho",
    status: "Pendente",
    comprovante: null,
  },
  {
    id: 9,
    funcionario: {
      id: 3,
      nome: "Carlos Santos",
      cargo: "Eletricista",
      avatar: null,
    },
    data: "2023-06-15",
    valor: 2200.0,
    tipo: "Salário Quinzenal",
    contaBancaria: null,
    observacao: "Pagamento referente à primeira quinzena de junho",
    status: "Pendente",
    comprovante: null,
  },
  {
    id: 10,
    funcionario: {
      id: 5,
      nome: "Pedro Souza",
      cargo: "Mestre de Obras",
      avatar: null,
    },
    data: "2023-06-15",
    valor: 4800.0,
    tipo: "Salário Mensal",
    contaBancaria: null,
    observacao: "Pagamento referente ao mês de junho",
    status: "Pendente",
    comprovante: null,
  },
]

// Formas de pagamento disponíveis
const formasPagamento = ["Transferência Bancária", "Boleto Bancário", "PIX", "Cheque", "Dinheiro"]

// Clientes para filtro
const clientes = [
  "Construtora XYZ",
  "Incorporadora ABC",
  "Empreiteira 123",
  "Construtora Horizonte",
  "Incorporadora Visão",
  "Construtora Futuro",
]

// Obras para filtro
const obras = [
  "Edifício Residencial Aurora",
  "Condomínio Jardim das Flores",
  "Reforma Comercial Centro",
  "Residencial Vista Mar",
  "Edifício Comercial Central",
  "Condomínio Parque Verde",
]

// Funcionários para filtro
const funcionarios = [
  { id: 1, nome: "João Silva", cargo: "Pedreiro" },
  { id: 2, nome: "Maria Oliveira", cargo: "Engenheira Civil" },
  { id: 3, nome: "Carlos Santos", cargo: "Eletricista" },
  { id: 4, nome: "Ana Pereira", cargo: "Arquiteta" },
  { id: 5, nome: "Pedro Souza", cargo: "Mestre de Obras" },
]

export default function FinanceiroPage() {
  // Estado para pesquisa
  const [searchTerm, setSearchTerm] = useState("")

  // Estado para filtros
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroCliente, setFiltroCliente] = useState<string[]>([])
  const [filtroObra, setFiltroObra] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState<string[]>([])
  const [filtroContaBancaria, setFiltroContaBancaria] = useState<string[]>([])
  const [filtroFuncionario, setFiltroFuncionario] = useState<number[]>([])

  // Estado para o filtro de data
  const [dateRangeEmissao, setDateRangeEmissao] = useState<DateRange | undefined>(undefined)
  const [dateRangePagamento, setDateRangePagamento] = useState<DateRange | undefined>(undefined)
  const [dateRangePagamentoFunc, setDateRangePagamentoFunc] = useState<DateRange | undefined>(undefined)

  // Estado para o diálogo de nova conta bancária
  const [novaContaDialogAberto, setNovaContaDialogAberto] = useState(false)
  const [novaConta, setNovaConta] = useState({
    nome: "",
    agencia: "",
    conta: "",
    tipo: "Conta Corrente",
    saldo: 0,
  })

  // Estado para o diálogo de edição de conta bancária
  const [editarContaDialogAberto, setEditarContaDialogAberto] = useState(false)
  const [contaSelecionada, setContaSelecionada] = useState<(typeof contasBancarias)[0] | null>(null)

  // Estado para o diálogo de ajuste de saldo
  const [ajustarSaldoDialogAberto, setAjustarSaldoDialogAberto] = useState(false)
  const [ajusteSaldo, setAjusteSaldo] = useState({
    valor: 0,
    tipo: "adicionar", // "adicionar" ou "remover"
    descricao: "",
  })

  // Estado para o diálogo de pagamento de orçamento
  const [pagamentoDialogAberto, setPagamentoDialogAberto] = useState(false)
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<(typeof orcamentos)[0] | null>(null)
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState("")
  const [contaBancariaSelecionada, setContaBancariaSelecionada] = useState("")

  // Estado para o diálogo de detalhes do orçamento
  const [detalhesOrcamentoDialogAberto, setDetalhesOrcamentoDialogAberto] = useState(false)

  // Estado para o diálogo de detalhes do pagamento de funcionário
  const [detalhesPagamentoDialogAberto, setDetalhesPagamentoDialogAberto] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<(typeof pagamentosFuncionarios)[0] | null>(null)

  // Estado para o diálogo de pagamento a funcionário
  const [pagamentoFuncionarioDialogAberto, setPagamentoFuncionarioDialogAberto] = useState(false)
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<(typeof funcionarios)[0] | null>(null)

  // Estado para seleção em massa de orçamentos
  const [orcamentosSelecionados, setOrcamentosSelecionados] = useState<number[]>([])
  const [pagamentoEmMassaOrcamentosDialogAberto, setPagamentoEmMassaOrcamentosDialogAberto] = useState(false)

  // Estado para seleção em massa de pagamentos de funcionários
  const [pagamentosFuncionariosSelecionados, setPagamentosFuncionariosSelecionados] = useState<number[]>([])
  const [pagamentoEmMassaFuncionariosDialogAberto, setPagamentoEmMassaFuncionariosDialogAberto] = useState(false)

  // Calcular saldo total
  const saldoTotal = contasBancarias.reduce((total, conta) => total + conta.saldo, 0)

  // Calcular total de orçamentos pagos
  const totalPago = orcamentos
    .filter((orcamento) => orcamento.status === "Pago")
    .reduce((total, orcamento) => total + orcamento.valor, 0)

  // Calcular total de orçamentos pendentes
  const totalPendente = orcamentos
    .filter((orcamento) => orcamento.status === "Aprovado")
    .reduce((total, orcamento) => total + orcamento.valor, 0)

  // Calcular total de pagamentos a funcionários
  const totalPagoFuncionarios = pagamentosFuncionarios.reduce((total, pagamento) => total + pagamento.valor, 0)

  // Calcular total de pagamentos pendentes a funcionários
  const totalPendenteFuncionarios = pagamentosFuncionarios
    .filter((pagamento) => pagamento.status === "Pendente")
    .reduce((total, pagamento) => total + pagamento.valor, 0)

  // Calcular total de orçamentos selecionados
  const totalOrcamentosSelecionados = orcamentos
    .filter((orcamento) => orcamentosSelecionados.includes(orcamento.id))
    .reduce((total, orcamento) => total + orcamento.valor, 0)

  // Calcular total de pagamentos de funcionários selecionados
  const totalPagamentosFuncionariosSelecionados = pagamentosFuncionarios
    .filter((pagamento) => pagamentosFuncionariosSelecionados.includes(pagamento.id))
    .reduce((total, pagamento) => total + pagamento.valor, 0)

  // Função para filtrar orçamentos
  const filtrarOrcamentos = (orcamentos: typeof orcamentos, apenasAprovados = false) => {
    return orcamentos.filter((orcamento) => {
      // Filtro por status (se apenasAprovados for true, mostrar apenas aprovados)
      if (apenasAprovados && orcamento.status !== "Aprovado") {
        return false
      }

      // Filtro por termo de pesquisa
      const matchesSearch =
        orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orcamento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orcamento.obra.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por cliente
      const matchesCliente = filtroCliente.length === 0 || filtroCliente.includes(orcamento.cliente)

      // Filtro por obra
      const matchesObra = filtroObra.length === 0 || filtroObra.includes(orcamento.obra)

      // Filtro por status
      const matchesStatus = filtroStatus.length === 0 || filtroStatus.includes(orcamento.status)

      // Filtro por forma de pagamento
      const matchesFormaPagamento =
        filtroFormaPagamento.length === 0 ||
        (orcamento.formaPagamento && filtroFormaPagamento.includes(orcamento.formaPagamento))

      // Filtro por conta bancária
      const matchesContaBancaria =
        filtroContaBancaria.length === 0 ||
        (orcamento.contaBancaria && filtroContaBancaria.includes(orcamento.contaBancaria))

      // Filtro por data de emissão
      let matchesDataEmissao = true
      if (dateRangeEmissao?.from) {
        const dataEmissao = new Date(orcamento.dataEmissao)

        if (dateRangeEmissao.to) {
          matchesDataEmissao = isWithinInterval(dataEmissao, {
            start: dateRangeEmissao.from,
            end: dateRangeEmissao.to,
          })
        } else {
          matchesDataEmissao = format(dataEmissao, "yyyy-MM-dd") === format(dateRangeEmissao.from, "yyyy-MM-dd")
        }
      }

      // Filtro por data de pagamento
      let matchesDataPagamento = true
      if (dateRangePagamento?.from) {
        if (orcamento.dataPagamento) {
          const dataPagamento = new Date(orcamento.dataPagamento)

          if (dateRangePagamento.to) {
            matchesDataPagamento = isWithinInterval(dataPagamento, {
              start: dateRangePagamento.from,
              end: dateRangePagamento.to,
            })
          } else {
            matchesDataPagamento = format(dataPagamento, "yyyy-MM-dd") === format(dateRangePagamento.from, "yyyy-MM-dd")
          }
        } else {
          matchesDataPagamento = false
        }
      }

      return (
        matchesSearch &&
        matchesCliente &&
        matchesObra &&
        matchesStatus &&
        matchesFormaPagamento &&
        matchesContaBancaria &&
        matchesDataEmissao &&
        matchesDataPagamento
      )
    })
  }

  // Função para filtrar pagamentos de funcionários
  const filtrarPagamentosFuncionarios = (pagamentos: typeof pagamentosFuncionarios, apenasPendentes = false) => {
    return pagamentos.filter((pagamento) => {
      // Filtro por status (se apenasPendentes for true, mostrar apenas pendentes)
      if (apenasPendentes && pagamento.status !== "Pendente") {
        return false
      }

      // Filtro por termo de pesquisa
      const matchesSearch =
        pagamento.funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.tipo.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por funcionário
      const matchesFuncionario = filtroFuncionario.length === 0 || filtroFuncionario.includes(pagamento.funcionario.id)

      // Filtro por conta bancária
      const matchesContaBancaria =
        filtroContaBancaria.length === 0 ||
        (pagamento.contaBancaria && filtroContaBancaria.includes(pagamento.contaBancaria))

      // Filtro por data de pagamento
      let matchesDataPagamento = true
      if (dateRangePagamentoFunc?.from) {
        const dataPagamento = new Date(pagamento.data)

        if (dateRangePagamentoFunc.to) {
          matchesDataPagamento = isWithinInterval(dataPagamento, {
            start: dateRangePagamentoFunc.from,
            end: dateRangePagamentoFunc.to,
          })
        } else {
          matchesDataPagamento =
            format(dataPagamento, "yyyy-MM-dd") === format(dateRangePagamentoFunc.from, "yyyy-MM-dd")
        }
      }

      return matchesSearch && matchesFuncionario && matchesContaBancaria && matchesDataPagamento
    })
  }

  // Orçamentos filtrados
  const orcamentosFiltrados = filtrarOrcamentos(orcamentos)
  const orcamentosPendentes = filtrarOrcamentos(orcamentos, true)

  // Pagamentos de funcionários filtrados
  const pagamentosFuncionariosFiltrados = filtrarPagamentosFuncionarios(pagamentosFuncionarios)
  const pagamentosFuncionariosPendentes = filtrarPagamentosFuncionarios(pagamentosFuncionarios, true)

  // Função para alternar seleção de cliente no filtro
  const toggleCliente = (cliente: string) => {
    setFiltroCliente((current) => {
      if (current.includes(cliente)) {
        return current.filter((c) => c !== cliente)
      } else {
        return [...current, cliente]
      }
    })
  }

  // Função para alternar seleção de obra no filtro
  const toggleObra = (obra: string) => {
    setFiltroObra((current) => {
      if (current.includes(obra)) {
        return current.filter((o) => o !== obra)
      } else {
        return [...current, obra]
      }
    })
  }

  // Função para alternar seleção de status no filtro
  const toggleStatus = (status: string) => {
    setFiltroStatus((current) => {
      if (current.includes(status)) {
        return current.filter((s) => s !== status)
      } else {
        return [...current, status]
      }
    })
  }

  // Função para alternar seleção de forma de pagamento no filtro
  const toggleFormaPagamento = (forma: string) => {
    setFiltroFormaPagamento((current) => {
      if (current.includes(forma)) {
        return current.filter((f) => f !== forma)
      } else {
        return [...current, forma]
      }
    })
  }

  // Função para alternar seleção de conta bancária no filtro
  const toggleContaBancaria = (conta: string) => {
    setFiltroContaBancaria((current) => {
      if (current.includes(conta)) {
        return current.filter((c) => c !== conta)
      } else {
        return [...current, conta]
      }
    })
  }

  // Função para alternar seleção de funcionário no filtro
  const toggleFuncionario = (id: number) => {
    setFiltroFuncionario((current) => {
      if (current.includes(id)) {
        return current.filter((f) => f !== id)
      } else {
        return [...current, id]
      }
    })
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroCliente([])
    setFiltroObra([])
    setFiltroStatus([])
    setFiltroFormaPagamento([])
    setFiltroContaBancaria([])
    setFiltroFuncionario([])
    setSearchTerm("")
    setDateRangeEmissao(undefined)
    setDateRangePagamento(undefined)
    setDateRangePagamentoFunc(undefined)
  }

  // Função para adicionar nova conta bancária
  const adicionarConta = () => {
    // Validar campos
    if (!novaConta.nome || !novaConta.agencia || !novaConta.conta) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Fechar o diálogo
    setNovaContaDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Conta Bancária Adicionada",
      description: `A conta ${novaConta.nome} foi adicionada com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar o formulário
    setNovaConta({
      nome: "",
      agencia: "",
      conta: "",
      tipo: "Conta Corrente",
      saldo: 0,
    })
  }

  // Função para abrir o diálogo de edição de conta
  const abrirDialogoEditarConta = (conta: (typeof contasBancarias)[0]) => {
    setContaSelecionada({ ...conta })
    setEditarContaDialogAberto(true)
  }

  // Função para salvar edição de conta
  const salvarEdicaoConta = () => {
    if (!contaSelecionada) return

    // Validar campos
    if (!contaSelecionada.nome || !contaSelecionada.agencia || !contaSelecionada.conta) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Fechar o diálogo
    setEditarContaDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Conta Bancária Atualizada",
      description: `A conta ${contaSelecionada.nome} foi atualizada com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar o estado
    setContaSelecionada(null)
  }

  // Função para abrir o diálogo de ajuste de saldo
  const abrirDialogoAjustarSaldo = (conta: (typeof contasBancarias)[0]) => {
    setContaSelecionada(conta)
    setAjusteSaldo({
      valor: 0,
      tipo: "adicionar",
      descricao: "",
    })
    setAjustarSaldoDialogAberto(true)
  }

  // Função para salvar ajuste de saldo
  const salvarAjusteSaldo = () => {
    if (!contaSelecionada || ajusteSaldo.valor <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido para o ajuste.",
        variant: "destructive",
      })
      return
    }

    // Calcular novo saldo
    const novoSaldo =
      ajusteSaldo.tipo === "adicionar"
        ? contaSelecionada.saldo + ajusteSaldo.valor
        : contaSelecionada.saldo - ajusteSaldo.valor

    // Fechar o diálogo
    setAjustarSaldoDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Saldo Ajustado",
      description: `O saldo da conta ${contaSelecionada.nome} foi ${
        ajusteSaldo.tipo === "adicionar" ? "aumentado" : "reduzido"
      } em R$ ${ajusteSaldo.valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}. Novo saldo: R$ ${novoSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar o estado
    setContaSelecionada(null)
    setAjusteSaldo({
      valor: 0,
      tipo: "adicionar",
      descricao: "",
    })
  }

  // Função para abrir o diálogo de pagamento
  const abrirDialogoPagamento = (orcamento: (typeof orcamentos)[0]) => {
    setOrcamentoSelecionado(orcamento)
    setFormaPagamentoSelecionada("")
    setContaBancariaSelecionada("")
    setPagamentoDialogAberto(true)
  }

  // Função para processar pagamento de orçamento
  const processarPagamento = () => {
    if (!orcamentoSelecionado || !formaPagamentoSelecionada || !contaBancariaSelecionada) return

    // Fechar o diálogo
    setPagamentoDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Pagamento Processado",
      description: `Pagamento do orçamento ${orcamentoSelecionado.numero} no valor de R$ ${orcamentoSelecionado.valor.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 },
      )} foi processado com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para abrir o diálogo de detalhes do orçamento
  const abrirDialogoDetalhesOrcamento = (orcamento: (typeof orcamentos)[0]) => {
    // setOrcamentoSelecionado(orcamento)
    // setDetalhesOrcamentoDialogAberto(true)
  }

  // Função para abrir o diálogo de detalhes do pagamento
  const abrirDialogoDetalhesPagamento = (pagamento: (typeof pagamentosFuncionarios)[0]) => {
    setPagamentoSelecionado(pagamento)
    setDetalhesPagamentoDialogAberto(true)
  }

  // Função para abrir o diálogo de pagamento a funcionário
  const abrirDialogoPagamentoFuncionario = (pagamento: (typeof pagamentosFuncionarios)[0]) => {
    setFuncionarioSelecionado(pagamento.funcionario)
    setPagamentoFuncionarioDialogAberto(true)
  }

  // Função para processar pagamento a funcionário
  const processarPagamentoFuncionario = () => {
    if (!funcionarioSelecionado || !contaBancariaSelecionada) return

    // Fechar o diálogo
    setPagamentoFuncionarioDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Pagamento Processado",
      description: `Pagamento ao funcionário ${funcionarioSelecionado.nome} foi processado com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
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

  // Função para alternar seleção de orçamento
  const toggleOrcamentoSelecionado = (id: number) => {
    setOrcamentosSelecionados((current) => {
      if (current.includes(id)) {
        return current.filter((o) => o !== id)
      } else {
        return [...current, id]
      }
    })
  }

  // Função para selecionar todos os orçamentos
  const selecionarTodosOrcamentos = () => {
    if (orcamentosSelecionados.length === orcamentosPendentes.length) {
      setOrcamentosSelecionados([])
    } else {
      setOrcamentosSelecionados(orcamentosPendentes.map((o) => o.id))
    }
  }

  // Função para alternar seleção de pagamento de funcionário
  const togglePagamentoFuncionarioSelecionado = (id: number) => {
    setPagamentosFuncionariosSelecionados((current) => {
      if (current.includes(id)) {
        return current.filter((p) => p !== id)
      } else {
        return [...current, id]
      }
    })
  }

  // Função para selecionar todos os pagamentos de funcionários
  const selecionarTodosPagamentosFuncionarios = () => {
    if (pagamentosFuncionariosSelecionados.length === pagamentosFuncionariosPendentes.length) {
      setPagamentosFuncionariosSelecionados([])
    } else {
      setPagamentosFuncionariosSelecionados(pagamentosFuncionariosPendentes.map((p) => p.id))
    }
  }

  // Função para abrir o diálogo de pagamento em massa de orçamentos
  const abrirDialogoPagamentoEmMassaOrcamentos = () => {
    setFormaPagamentoSelecionada("")
    setContaBancariaSelecionada("")
    setPagamentoEmMassaOrcamentosDialogAberto(true)
  }

  // Função para processar pagamento em massa de orçamentos
  const processarPagamentoEmMassaOrcamentos = () => {
    if (!formaPagamentoSelecionada || !contaBancariaSelecionada) return

    // Fechar o diálogo
    setPagamentoEmMassaOrcamentosDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Pagamentos Processados",
      description: `${orcamentosSelecionados.length} orçamentos foram pagos com sucesso no valor total de R$ ${totalOrcamentosSelecionados.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 },
      )}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar seleção
    setOrcamentosSelecionados([])
  }

  // Função para abrir o diálogo de pagamento em massa de funcionários
  const abrirDialogoPagamentoEmMassaFuncionarios = () => {
    setContaBancariaSelecionada("")
    setPagamentoEmMassaFuncionariosDialogAberto(true)
  }

  // Função para processar pagamento em massa de funcionários
  const processarPagamentoEmMassaFuncionarios = () => {
    if (!contaBancariaSelecionada) return

    // Fechar o diálogo
    setPagamentoEmMassaFuncionariosDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Pagamentos Processados",
      description: `${pagamentosFuncionariosSelecionados.length} pagamentos a funcionários foram processados com sucesso no valor total de R$ ${totalPagamentosFuncionariosSelecionados.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 },
      )}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar seleção
    setPagamentosFuncionariosSelecionados([])
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <BankIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Saldo total em {contasBancarias.length} contas bancárias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Pagos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {orcamentos.filter((o) => o.status === "Pago").length} orçamentos pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {orcamentos.filter((o) => o.status === "Aprovado").length} orçamentos pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos a Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalPendenteFuncionarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentosFuncionarios.filter((p) => p.status === "Pendente").length} pagamentos pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contas">
        <TabsList className="mb-4">
          <TabsTrigger value="contas">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="pendentes">Pagamentos Pendentes</TabsTrigger>
          <TabsTrigger value="funcionarios">Pagamentos a Funcionários</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="contas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Contas Bancárias</h3>
            <Dialog open={novaContaDialogAberto} onOpenChange={setNovaContaDialogAberto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Conta Bancária</DialogTitle>
                  <DialogDescription>Preencha os dados da nova conta bancária.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Conta</Label>
                    <Input
                      id="nome"
                      value={novaConta.nome}
                      onChange={(e) => setNovaConta({ ...novaConta, nome: e.target.value })}
                      placeholder="Ex: Banco do Brasil - Conta Principal"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="agencia">Agência</Label>
                      <Input
                        id="agencia"
                        value={novaConta.agencia}
                        onChange={(e) => setNovaConta({ ...novaConta, agencia: e.target.value })}
                        placeholder="Ex: 1234-5"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="conta">Conta</Label>
                      <Input
                        id="conta"
                        value={novaConta.conta}
                        onChange={(e) => setNovaConta({ ...novaConta, conta: e.target.value })}
                        placeholder="Ex: 12345-6"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de Conta</Label>
                    <select
                      id="tipo"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={novaConta.tipo}
                      onChange={(e) => setNovaConta({ ...novaConta, tipo: e.target.value })}
                    >
                      <option value="Conta Corrente">Conta Corrente</option>
                      <option value="Conta Poupança">Conta Poupança</option>
                      <option value="Conta Investimento">Conta Investimento</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
                    <Input
                      id="saldo"
                      type="number"
                      value={novaConta.saldo}
                      onChange={(e) => setNovaConta({ ...novaConta, saldo: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNovaContaDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={adicionarConta}>Adicionar Conta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Agência</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Saldo (R$)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasBancarias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhuma conta bancária encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contasBancarias.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.nome}</TableCell>
                        <TableCell>{conta.agencia}</TableCell>
                        <TableCell>{conta.conta}</TableCell>
                        <TableCell>{conta.tipo}</TableCell>
                        <TableCell className="font-medium">
                          {conta.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                              <DropdownMenuItem onClick={() => abrirDialogoEditarConta(conta)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => abrirDialogoAjustarSaldo(conta)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Ajustar Saldo
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

        <TabsContent value="orcamentos" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Orçamentos</h3>
              <p className="text-sm text-muted-foreground">Visualize todos os orçamentos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <DateRangePicker
                value={dateRangeEmissao}
                onChange={setDateRangeEmissao}
                placeholder="Filtrar por data de emissão"
                align="end"
                locale={ptBR}
              />
              <DateRangePicker
                value={dateRangePagamento}
                onChange={setDateRangePagamento}
                placeholder="Filtrar por data de pagamento"
                align="end"
                locale={ptBR}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar orçamentos..."
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
                    <h5 className="text-sm font-medium">Status</h5>
                    <div className="space-y-2">
                      {["Aprovado", "Pago"].map((status) => (
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
                    <h5 className="text-sm font-medium">Cliente</h5>
                    <div className="space-y-2">
                      {clientes.map((cliente) => (
                        <div key={cliente} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cliente-${cliente}`}
                            checked={filtroCliente.includes(cliente)}
                            onCheckedChange={() => toggleCliente(cliente)}
                          />
                          <label
                            htmlFor={`cliente-${cliente}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cliente}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Obra</h5>
                    <div className="space-y-2">
                      {obras.map((obra) => (
                        <div key={obra} className="flex items-center space-x-2">
                          <Checkbox
                            id={`obra-${obra}`}
                            checked={filtroObra.includes(obra)}
                            onCheckedChange={() => toggleObra(obra)}
                          />
                          <label
                            htmlFor={`obra-${obra}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {obra}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Forma de Pagamento</h5>
                    <div className="space-y-2">
                      {formasPagamento.map((forma) => (
                        <div key={forma} className="flex items-center space-x-2">
                          <Checkbox
                            id={`forma-${forma}`}
                            checked={filtroFormaPagamento.includes(forma)}
                            onCheckedChange={() => toggleFormaPagamento(forma)}
                          />
                          <label
                            htmlFor={`forma-${forma}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {forma}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Conta Bancária</h5>
                    <div className="space-y-2">
                      {contasBancarias.map((conta) => (
                        <div key={conta.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`conta-${conta.id}`}
                            checked={filtroContaBancaria.includes(conta.nome)}
                            onCheckedChange={() => toggleContaBancaria(conta.nome)}
                          />
                          <label
                            htmlFor={`conta-${conta.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {conta.nome}
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
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Data de Aprovação</TableHead>
                    <TableHead>Data de Pagamento</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Conta Bancária</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        Nenhum orçamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orcamentosFiltrados.map((orcamento) => (
                      <TableRow key={orcamento.id}>
                        <TableCell className="font-medium">{orcamento.numero}</TableCell>
                        <TableCell>{orcamento.cliente}</TableCell>
                        <TableCell>{orcamento.obra}</TableCell>
                        <TableCell>{format(new Date(orcamento.dataEmissao), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{format(new Date(orcamento.dataAprovacao), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          {orcamento.dataPagamento
                            ? format(new Date(orcamento.dataPagamento), "dd/MM/yyyy")
                            : "Pendente"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {orcamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={orcamento.status === "Pago" ? "default" : "secondary"}
                            className={orcamento.status === "Pago" ? "bg-green-500" : "bg-yellow-500"}
                          >
                            {orcamento.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{orcamento.formaPagamento || "Não definido"}</TableCell>
                        <TableCell>{orcamento.contaBancaria || "Não definido"}</TableCell>
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
                                <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              {orcamento.status === "Aprovado" && (
                                <DropdownMenuItem onClick={() => abrirDialogoPagamento(orcamento)}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Registrar Pagamento
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Pagamentos Pendentes</h3>
              <p className="text-sm text-muted-foreground">Orçamentos aprovados aguardando pagamento</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendente</p>
              <p className="text-2xl font-bold">
                R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-orcamentos"
                checked={orcamentosSelecionados.length === orcamentosPendentes.length && orcamentosPendentes.length > 0}
                onCheckedChange={selecionarTodosOrcamentos}
              />
              <label
                htmlFor="select-all-orcamentos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecionar todos
              </label>
            </div>
            {orcamentosSelecionados.length > 0 && (
              <Button onClick={abrirDialogoPagamentoEmMassaOrcamentos}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar {orcamentosSelecionados.length} orçamentos (
                {totalOrcamentosSelecionados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
              </Button>
            )}
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Data de Aprovação</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentosPendentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum pagamento pendente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orcamentosPendentes.map((orcamento) => (
                      <TableRow key={orcamento.id}>
                        <TableCell>
                          <Checkbox
                            checked={orcamentosSelecionados.includes(orcamento.id)}
                            onCheckedChange={() => toggleOrcamentoSelecionado(orcamento.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{orcamento.numero}</TableCell>
                        <TableCell>{orcamento.cliente}</TableCell>
                        <TableCell>{orcamento.obra}</TableCell>
                        <TableCell>{format(new Date(orcamento.dataAprovacao), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="font-medium">
                          {orcamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => abrirDialogoPagamento(orcamento)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pagar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="funcionarios" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Pagamentos Pendentes a Funcionários</h3>
              <p className="text-sm text-muted-foreground">Pagamentos em aberto aguardando processamento</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendente</p>
              <p className="text-2xl font-bold">
                R$ {totalPendenteFuncionarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-funcionarios"
                checked={
                  pagamentosFuncionariosSelecionados.length === pagamentosFuncionariosPendentes.length &&
                  pagamentosFuncionariosPendentes.length > 0
                }
                onCheckedChange={selecionarTodosPagamentosFuncionarios}
              />
              <label
                htmlFor="select-all-funcionarios"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecionar todos
              </label>
            </div>
            {pagamentosFuncionariosSelecionados.length > 0 && (
              <Button onClick={abrirDialogoPagamentoEmMassaFuncionarios}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar {pagamentosFuncionariosSelecionados.length} funcionários (
                {totalPagamentosFuncionariosSelecionados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
              </Button>
            )}
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosFuncionariosPendentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum pagamento pendente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagamentosFuncionariosPendentes.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell>
                          <Checkbox
                            checked={pagamentosFuncionariosSelecionados.includes(pagamento.id)}
                            onCheckedChange={() => togglePagamentoFuncionarioSelecionado(pagamento.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {pagamento.funcionario.avatar ? (
                                <AvatarImage
                                  src={pagamento.funcionario.avatar || "/placeholder.svg"}
                                  alt={pagamento.funcionario.nome}
                                />
                              ) : (
                                <AvatarFallback>
                                  {pagamento.funcionario.nome
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{pagamento.funcionario.nome}</p>
                              <p className="text-xs text-muted-foreground">{pagamento.funcionario.cargo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(pagamento.data), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{pagamento.tipo}</TableCell>
                        <TableCell className="font-medium">
                          {pagamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={pagamento.observacao}>
                          {pagamento.observacao}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => abrirDialogoPagamentoFuncionario(pagamento)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pagar
                          </Button>
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
              <p className="text-sm text-muted-foreground">Pagamentos já processados</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <DateRangePicker
                value={dateRangePagamentoFunc}
                onChange={setDateRangePagamentoFunc}
                placeholder="Filtrar por data de pagamento"
                align="end"
                locale={ptBR}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pagamentos..."
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
                    <h5 className="text-sm font-medium">Funcionário</h5>
                    <div className="space-y-2">
                      {funcionarios.map((funcionario) => (
                        <div key={funcionario.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`funcionario-${funcionario.id}`}
                            checked={filtroFuncionario.includes(funcionario.id)}
                            onCheckedChange={() => toggleFuncionario(funcionario.id)}
                          />
                          <label
                            htmlFor={`funcionario-${funcionario.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {funcionario.nome} ({funcionario.cargo})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Conta Bancária</h5>
                    <div className="space-y-2">
                      {contasBancarias.map((conta) => (
                        <div key={conta.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`conta-func-${conta.id}`}
                            checked={filtroContaBancaria.includes(conta.nome)}
                            onCheckedChange={() => toggleContaBancaria(conta.nome)}
                          />
                          <label
                            htmlFor={`conta-func-${conta.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {conta.nome}
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
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor (R$)</TableHead>
                    <TableHead>Conta Bancária</TableHead>
                    <TableHead>Comprovante</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosFuncionarios.filter((p) => p.status === "Pago").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum pagamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagamentosFuncionarios
                      .filter((p) => p.status === "Pago")
                      .map((pagamento) => (
                        <TableRow key={pagamento.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {pagamento.funcionario.avatar ? (
                                  <AvatarImage
                                    src={pagamento.funcionario.avatar || "/placeholder.svg"}
                                    alt={pagamento.funcionario.nome}
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {pagamento.funcionario.nome
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .substring(0, 2)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">{pagamento.funcionario.nome}</p>
                                <p className="text-xs text-muted-foreground">{pagamento.funcionario.cargo}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(pagamento.data), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{pagamento.tipo}</TableCell>
                          <TableCell className="font-medium">
                            {pagamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{pagamento.contaBancaria}</TableCell>
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
                                <DropdownMenuItem onClick={() => abrirDialogoDetalhesPagamento(pagamento)}>
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
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Edição de Conta Bancária */}
      <Dialog open={editarContaDialogAberto} onOpenChange={setEditarContaDialogAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
            <DialogDescription>Atualize os dados da conta bancária.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {contaSelecionada && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-nome">Nome da Conta</Label>
                  <Input
                    id="edit-nome"
                    value={contaSelecionada.nome}
                    onChange={(e) => setContaSelecionada({ ...contaSelecionada, nome: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-agencia">Agência</Label>
                    <Input
                      id="edit-agencia"
                      value={contaSelecionada.agencia}
                      onChange={(e) => setContaSelecionada({ ...contaSelecionada, agencia: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-conta">Conta</Label>
                    <Input
                      id="edit-conta"
                      value={contaSelecionada.conta}
                      onChange={(e) => setContaSelecionada({ ...contaSelecionada, conta: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tipo">Tipo de Conta</Label>
                  <select
                    id="edit-tipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={contaSelecionada.tipo}
                    onChange={(e) => setContaSelecionada({ ...contaSelecionada, tipo: e.target.value })}
                  >
                    <option value="Conta Corrente">Conta Corrente</option>
                    <option value="Conta Poupança">Conta Poupança</option>
                    <option value="Conta Investimento">Conta Investimento</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditarContaDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicaoConta}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Ajuste de Saldo */}
      <Dialog open={ajustarSaldoDialogAberto} onOpenChange={setAjustarSaldoDialogAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajustar Saldo</DialogTitle>
            <DialogDescription>
              {contaSelecionada &&
                `Saldo atual: R$ ${contaSelecionada.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ajuste-tipo">Tipo de Ajuste</Label>
              <select
                id="ajuste-tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={ajusteSaldo.tipo}
                onChange={(e) => setAjusteSaldo({ ...ajusteSaldo, tipo: e.target.value })}
              >
                <option value="adicionar">Adicionar Valor</option>
                <option value="remover">Remover Valor</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ajuste-valor">Valor (R$)</Label>
              <Input
                id="ajuste-valor"
                type="number"
                min="0"
                step="0.01"
                value={ajusteSaldo.valor}
                onChange={(e) => setAjusteSaldo({ ...ajusteSaldo, valor: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ajuste-descricao">Descrição</Label>
              <Input
                id="ajuste-descricao"
                value={ajusteSaldo.descricao}
                onChange={(e) => setAjusteSaldo({ ...ajusteSaldo, descricao: e.target.value })}
                placeholder="Ex: Depósito em dinheiro"
              />
            </div>
            {contaSelecionada && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Novo saldo após ajuste:</p>
                <p className="text-lg font-bold">
                  R${" "}
                  {(ajusteSaldo.tipo === "adicionar"
                    ? contaSelecionada.saldo + ajusteSaldo.valor
                    : contaSelecionada.saldo - ajusteSaldo.valor
                  ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAjustarSaldoDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarAjusteSaldo}>Confirmar Ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Pagamento de Orçamento */}
      <Dialog open={pagamentoDialogAberto} onOpenChange={setPagamentoDialogAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>Preencha os dados do pagamento do orçamento.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {orcamentoSelecionado && (
              <>
                <div className="space-y-1">
                  <h4 className="font-medium">Orçamento</h4>
                  <p>{orcamentoSelecionado.numero}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Cliente</h4>
                    <p>{orcamentoSelecionado.cliente}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Obra</h4>
                    <p>{orcamentoSelecionado.obra}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Data de Aprovação</h4>
                    <p>{format(new Date(orcamentoSelecionado.dataAprovacao), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Valor</h4>
                    <p className="font-bold">
                      R$ {orcamentoSelecionado.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <select
                    id="formaPagamento"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formaPagamentoSelecionada}
                    onChange={(e) => setFormaPagamentoSelecionada(e.target.value)}
                  >
                    <option value="">Selecione uma forma de pagamento</option>
                    {formasPagamento.map((forma) => (
                      <option key={forma} value={forma}>
                        {forma}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contaBancaria">Conta Bancária</Label>
                  <select
                    id="contaBancaria"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={contaBancariaSelecionada}
                    onChange={(e) => setContaBancariaSelecionada(e.target.value)}
                  >
                    <option value="">Selecione uma conta bancária</option>
                    {contasBancarias.map((conta) => (
                      <option key={conta.id} value={conta.nome}>
                        {conta.nome} (Saldo: R$ {conta.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPagamento">Data de Pagamento</Label>
                  <Input id="dataPagamento" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comprovante">Anexar Comprovante</Label>
                  <div className="flex items-center gap-2">
                    <Input id="comprovante" type="file" className="flex-1" />
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
            <Button variant="outline" onClick={() => setPagamentoDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={processarPagamento} disabled={!formaPagamentoSelecionada || !contaBancariaSelecionada}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Detalhes do Pagamento de Funcionário */}
      <Dialog open={detalhesPagamentoDialogAberto} onOpenChange={setDetalhesPagamentoDialogAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          {pagamentoSelecionado && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  {pagamentoSelecionado.funcionario.avatar ? (
                    <AvatarImage
                      src={pagamentoSelecionado.funcionario.avatar || "/placeholder.svg"}
                      alt={pagamentoSelecionado.funcionario.nome}
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {pagamentoSelecionado.funcionario.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{pagamentoSelecionado.funcionario.nome}</h3>
                  <p className="text-sm text-muted-foreground">{pagamentoSelecionado.funcionario.cargo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Data do Pagamento</h4>
                  <p>{format(new Date(pagamentoSelecionado.data), "dd/MM/yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Tipo de Pagamento</h4>
                  <p>{pagamentoSelecionado.tipo}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Valor</h4>
                  <p className="font-bold">
                    R$ {pagamentoSelecionado.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Conta Bancária</h4>
                  <p>{pagamentoSelecionado.contaBancaria}</p>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium">Observação</h4>
                <p className="text-sm">{pagamentoSelecionado.observacao}</p>
              </div>

              {pagamentoSelecionado.comprovante && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Comprovante</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{pagamentoSelecionado.comprovante}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportarComprovante(pagamentoSelecionado.comprovante!)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-muted p-3 rounded-md mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="font-medium">Pagamento Processado</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Este pagamento foi processado em {format(new Date(pagamentoSelecionado.data), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetalhesPagamentoDialogAberto(false)}>
              Fechar
            </Button>
            {pagamentoSelecionado?.comprovante && (
              <Button onClick={() => exportarComprovante(pagamentoSelecionado.comprovante!)}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Comprovante
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Pagamento a Funcionário */}
      <Dialog open={pagamentoFuncionarioDialogAberto} onOpenChange={setPagamentoFuncionarioDialogAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Efetuar Pagamento a Funcionário</DialogTitle>
            <DialogDescription>Preencha os dados para efetuar o pagamento.</DialogDescription>
          </DialogHeader>
          {funcionarioSelecionado && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {funcionarioSelecionado.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{funcionarioSelecionado.nome}</h3>
                  <p className="text-sm text-muted-foreground">{funcionarioSelecionado.cargo}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo-pagamento">Tipo de Pagamento</Label>
                <select
                  id="tipo-pagamento"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Salário Quinzenal">Salário Quinzenal</option>
                  <option value="Salário Mensal">Salário Mensal</option>
                  <option value="Adiantamento">Adiantamento</option>
                  <option value="Férias">Férias</option>
                  <option value="13º Salário">13º Salário</option>
                  <option value="Bônus">Bônus</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor-pagamento">Valor (R$)</Label>
                <Input id="valor-pagamento" type="number" min="0" step="0.01" placeholder="0,00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta-bancaria-pagamento">Conta Bancária</Label>
                <select
                  id="conta-bancaria-pagamento"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={contaBancariaSelecionada}
                  onChange={(e) => setContaBancariaSelecionada(e.target.value)}
                >
                  <option value="">Selecione uma conta bancária</option>
                  {contasBancarias.map((conta) => (
                    <option key={conta.id} value={conta.nome}>
                      {conta.nome} (Saldo: R$ {conta.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-pagamento">Data de Pagamento</Label>
                <Input id="data-pagamento" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao-pagamento">Observação</Label>
                <Input id="observacao-pagamento" placeholder="Ex: Pagamento referente à primeira quinzena de junho" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comprovante-funcionario">Anexar Comprovante</Label>
                <div className="flex items-center gap-2">
                  <Input id="comprovante-funcionario" type="file" className="flex-1" />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoFuncionarioDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={processarPagamentoFuncionario} disabled={!contaBancariaSelecionada}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Pagamento em Massa de Orçamentos */}
      <Dialog open={pagamentoEmMassaOrcamentosDialogAberto} onOpenChange={setPagamentoEmMassaOrcamentosDialogAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pagamento em Massa de Orçamentos</DialogTitle>
            <DialogDescription>
              Você está prestes a processar o pagamento de {orcamentosSelecionados.length} orçamentos no valor total de
              R$ {totalOrcamentosSelecionados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forma-pagamento-massa">Forma de Pagamento</Label>
              <select
                id="forma-pagamento-massa"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formaPagamentoSelecionada}
                onChange={(e) => setFormaPagamentoSelecionada(e.target.value)}
              >
                <option value="">Selecione uma forma de pagamento</option>
                {formasPagamento.map((forma) => (
                  <option key={forma} value={forma}>
                    {forma}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta-bancaria-massa">Conta Bancária</Label>
              <select
                id="conta-bancaria-massa"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={contaBancariaSelecionada}
                onChange={(e) => setContaBancariaSelecionada(e.target.value)}
              >
                <option value="">Selecione uma conta bancária</option>
                {contasBancarias.map((conta) => (
                  <option key={conta.id} value={conta.nome}>
                    {conta.nome} (Saldo: R$ {conta.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-pagamento-massa">Data de Pagamento</Label>
              <Input id="data-pagamento-massa" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprovante-massa">Anexar Comprovante</Label>
              <div className="flex items-center gap-2">
                <Input id="comprovante-massa" type="file" className="flex-1" />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
            </div>

            <div className="bg-muted p-3 rounded-md mt-4">
              <h4 className="text-sm font-medium mb-2">Orçamentos selecionados:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {orcamentos
                  .filter((orcamento) => orcamentosSelecionados.includes(orcamento.id))
                  .map((orcamento) => (
                    <div key={orcamento.id} className="flex justify-between items-center text-sm">
                      <span>
                        {orcamento.numero} - {orcamento.cliente}
                      </span>
                      <span className="font-medium">
                        R$ {orcamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoEmMassaOrcamentosDialogAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={processarPagamentoEmMassaOrcamentos}
              disabled={!formaPagamentoSelecionada || !contaBancariaSelecionada}
            >
              Confirmar Pagamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Pagamento em Massa de Funcionários */}
      <Dialog
        open={pagamentoEmMassaFuncionariosDialogAberto}
        onOpenChange={setPagamentoEmMassaFuncionariosDialogAberto}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pagamento em Massa de Funcionários</DialogTitle>
            <DialogDescription>
              Você está prestes a processar o pagamento de {pagamentosFuncionariosSelecionados.length} funcionários no
              valor total de R${" "}
              {totalPagamentosFuncionariosSelecionados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conta-bancaria-func-massa">Conta Bancária</Label>
              <select
                id="conta-bancaria-func-massa"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={contaBancariaSelecionada}
                onChange={(e) => setContaBancariaSelecionada(e.target.value)}
              >
                <option value="">Selecione uma conta bancária</option>
                {contasBancarias.map((conta) => (
                  <option key={conta.id} value={conta.nome}>
                    {conta.nome} (Saldo: R$ {conta.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-pagamento-func-massa">Data de Pagamento</Label>
              <Input id="data-pagamento-func-massa" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprovante-func-massa">Anexar Comprovante</Label>
              <div className="flex items-center gap-2">
                <Input id="comprovante-func-massa" type="file" className="flex-1" />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
            </div>

            <div className="bg-muted p-3 rounded-md mt-4">
              <h4 className="text-sm font-medium mb-2">Funcionários selecionados:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {pagamentosFuncionarios
                  .filter((pagamento) => pagamentosFuncionariosSelecionados.includes(pagamento.id))
                  .map((pagamento) => (
                    <div key={pagamento.id} className="flex justify-between items-center text-sm">
                      <span>
                        {pagamento.funcionario.nome} - {pagamento.tipo}
                      </span>
                      <span className="font-medium">
                        R$ {pagamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoEmMassaFuncionariosDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={processarPagamentoEmMassaFuncionarios} disabled={!contaBancariaSelecionada}>
              Confirmar Pagamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
