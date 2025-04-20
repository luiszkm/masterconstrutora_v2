"use client"

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
  FileText,
  Filter,
  ChevronDown,
  Building,
  Users,
  Percent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Definição das etapas da obra
export type EtapaObra = {
  id: string
  nome: string
  concluida: boolean
  progresso: number // 0-100%
}

// Dados de exemplo - obras (com etapas)
const obras = [
  {
    id: 1,
    nome: "Mansão Alphaville",
    cliente: "Roberto Mendes",
    endereco: "Alphaville, São Paulo - SP",
    dataInicio: "15/03/2022",
    dataFim: "20/06/2023",
    status: "Concluída",
    responsavel: "Maria Oliveira",
    etapas: [
      { id: "fundacao", nome: "Fundação", concluida: true, progresso: 100 },
      { id: "estrutura", nome: "Estrutura", concluida: true, progresso: 100 },
      { id: "alvenaria", nome: "Alvenaria", concluida: true, progresso: 100 },
      { id: "instalacao", nome: "Instalação", concluida: true, progresso: 100 },
      { id: "acabamento", nome: "Acabamento", concluida: true, progresso: 100 },
    ],
    descricao: "Construção de mansão de alto padrão com 5 suítes, piscina, área de lazer completa e paisagismo.",
    orcamentos: [
      {
        id: 1,
        numero: "ORC-2022-001",
        valor: 1250000.0,
        dataEmissao: "10/02/2022",
        status: "Pago",
      },
      {
        id: 2,
        numero: "ORC-2022-002",
        valor: 350000.0,
        dataEmissao: "05/05/2022",
        status: "Pago",
      },
    ],
    fornecedores: [
      {
        id: 1,
        nome: "Materiais Premium Ltda",
        tipo: "Materiais de Construção",
        contato: "(11) 98765-4321",
      },
      {
        id: 2,
        nome: "Mármores & Granitos SA",
        tipo: "Acabamentos",
        contato: "(11) 91234-5678",
      },
    ],
  },
  {
    id: 2,
    nome: "Residência Beira-Mar",
    cliente: "Carla Oliveira",
    endereco: "Guarujá, São Paulo - SP",
    dataInicio: "10/07/2022",
    dataFim: "15/12/2023",
    status: "Em andamento",
    responsavel: "Carlos Santos",
    etapas: [
      { id: "fundacao", nome: "Fundação", concluida: true, progresso: 100 },
      { id: "estrutura", nome: "Estrutura", concluida: true, progresso: 100 },
      { id: "alvenaria", nome: "Alvenaria", concluida: true, progresso: 100 },
      { id: "instalacao", nome: "Instalação", concluida: false, progresso: 75 },
      { id: "acabamento", nome: "Acabamento", concluida: false, progresso: 0 },
    ],
    descricao: "Construção de casa de praia com 4 quartos, vista para o mar, deck e área gourmet.",
    orcamentos: [
      {
        id: 3,
        numero: "ORC-2022-003",
        valor: 980000.0,
        dataEmissao: "01/06/2022",
        status: "Pago",
      },
      {
        id: 4,
        numero: "ORC-2023-001",
        valor: 120000.0,
        dataEmissao: "15/01/2023",
        status: "Aprovado",
      },
    ],
    fornecedores: [
      {
        id: 3,
        nome: "Elétrica Total",
        tipo: "Instalações Elétricas",
        contato: "(13) 98888-7777",
      },
      {
        id: 4,
        nome: "Hidráulica Express",
        tipo: "Instalações Hidráulicas",
        contato: "(13) 97777-8888",
      },
    ],
  },
  {
    id: 3,
    nome: "Cobertura Duplex",
    cliente: "Fernando Almeida",
    endereco: "Jardins, São Paulo - SP",
    dataInicio: "05/01/2023",
    dataFim: "30/09/2023",
    status: "Concluída",
    responsavel: "Ana Pereira",
    etapas: [
      { id: "fundacao", nome: "Fundação", concluida: true, progresso: 100 },
      { id: "estrutura", nome: "Estrutura", concluida: true, progresso: 100 },
      { id: "alvenaria", nome: "Alvenaria", concluida: true, progresso: 100 },
      { id: "instalacao", nome: "Instalação", concluida: true, progresso: 100 },
      { id: "acabamento", nome: "Acabamento", concluida: true, progresso: 100 },
    ],
    descricao: "Reforma completa de cobertura duplex com 300m², incluindo automação residencial e energia solar.",
    orcamentos: [
      {
        id: 5,
        numero: "ORC-2022-004",
        valor: 750000.0,
        dataEmissao: "10/12/2022",
        status: "Pago",
      },
    ],
    fornecedores: [
      {
        id: 5,
        nome: "Madeiras Nobres",
        tipo: "Madeiras e Pisos",
        contato: "(11) 95555-6666",
      },
    ],
  },
  {
    id: 4,
    nome: "Refúgio na Serra",
    cliente: "Juliana Martins",
    endereco: "Campos do Jordão, São Paulo - SP",
    dataInicio: "20/02/2023",
    dataFim: "10/12/2023",
    status: "Em andamento",
    responsavel: "Pedro Souza",
    etapas: [
      { id: "fundacao", nome: "Fundação", concluida: true, progresso: 100 },
      { id: "estrutura", nome: "Estrutura", concluida: true, progresso: 100 },
      { id: "alvenaria", nome: "Alvenaria", concluida: false, progresso: 25 },
      { id: "instalacao", nome: "Instalação", concluida: false, progresso: 0 },
      { id: "acabamento", nome: "Acabamento", concluida: false, progresso: 0 },
    ],
    descricao: "Construção de casa de campo em estilo rústico com estrutura de madeira, lareira e vista panorâmica.",
    orcamentos: [
      {
        id: 6,
        numero: "ORC-2023-002",
        valor: 650000.0,
        dataEmissao: "05/01/2023",
        status: "Pago",
      },
      {
        id: 7,
        numero: "ORC-2023-003",
        valor: 180000.0,
        dataEmissao: "10/06/2023",
        status: "Aprovado",
      },
    ],
    fornecedores: [
      {
        id: 1,
        nome: "Materiais Premium Ltda",
        tipo: "Materiais de Construção",
        contato: "(11) 98765-4321",
      },
      {
        id: 5,
        nome: "Madeiras Nobres",
        tipo: "Madeiras e Pisos",
        contato: "(11) 95555-6666",
      },
    ],
  },
  {
    id: 5,
    nome: "Mansão Neoclássica",
    cliente: "Ricardo Souza",
    endereco: "Morumbi, São Paulo - SP",
    dataInicio: "15/04/2023",
    dataFim: "25/08/2024",
    status: "Em andamento",
    responsavel: "Maria Oliveira",
    etapas: [
      { id: "fundacao", nome: "Fundação", concluida: true, progresso: 100 },
      { id: "estrutura", nome: "Estrutura", concluida: false, progresso: 50 },
      { id: "alvenaria", nome: "Alvenaria", concluida: false, progresso: 0 },
      { id: "instalacao", nome: "Instalação", concluida: false, progresso: 0 },
      { id: "acabamento", nome: "Acabamento", concluida: false, progresso: 0 },
    ],
    descricao: "Construção de mansão em estilo neoclássico com 6 suítes, cinema, adega, spa e garagem para 8 carros.",
    orcamentos: [
      {
        id: 8,
        numero: "ORC-2023-004",
        valor: 3500000.0,
        dataEmissao: "01/03/2023",
        status: "Pago",
      },
      {
        id: 9,
        numero: "ORC-2023-005",
        valor: 1200000.0,
        dataEmissao: "15/07/2023",
        status: "Aprovado",
      },
    ],
    fornecedores: [
      {
        id: 2,
        nome: "Mármores & Granitos SA",
        tipo: "Acabamentos",
        contato: "(11) 91234-5678",
      },
      {
        id: 3,
        nome: "Elétrica Total",
        tipo: "Instalações Elétricas",
        contato: "(13) 98888-7777",
      },
      {
        id: 4,
        nome: "Hidráulica Express",
        tipo: "Instalações Hidráulicas",
        contato: "(13) 97777-8888",
      },
    ],
  },
]

// Dados de exemplo - funcionários que trabalharam nas obras
const funcionariosObras = [
  {
    obraId: 1,
    funcionarios: [
      {
        id: 1,
        nome: "João Silva",
        cargo: "Pedreiro",
        periodo: "15/03/2022 - 20/06/2023",
        avatar: "/confident-leader.png",
      },
      {
        id: 2,
        nome: "Maria Oliveira",
        cargo: "Engenheira Civil",
        periodo: "15/03/2022 - 20/06/2023",
        avatar: "/confident-executive.png",
      },
      {
        id: 3,
        nome: "Carlos Santos",
        cargo: "Eletricista",
        periodo: "10/04/2022 - 15/05/2023",
        avatar: null,
      },
    ],
  },
  {
    obraId: 2,
    funcionarios: [
      {
        id: 1,
        nome: "João Silva",
        cargo: "Pedreiro",
        periodo: "10/07/2022 - Atual",
        avatar: "/confident-leader.png",
      },
      {
        id: 4,
        nome: "Ana Pereira",
        cargo: "Arquiteta",
        periodo: "10/07/2022 - 15/12/2023",
        avatar: null,
      },
    ],
  },
  {
    obraId: 3,
    funcionarios: [
      {
        id: 3,
        nome: "Carlos Santos",
        cargo: "Eletricista",
        periodo: "05/01/2023 - 30/09/2023",
        avatar: null,
      },
      {
        id: 5,
        nome: "Pedro Souza",
        cargo: "Mestre de Obras",
        periodo: "05/01/2023 - 30/09/2023",
        avatar: null,
      },
    ],
  },
  {
    obraId: 4,
    funcionarios: [
      {
        id: 1,
        nome: "João Silva",
        cargo: "Pedreiro",
        periodo: "20/02/2023 - Atual",
        avatar: "/confident-leader.png",
      },
      {
        id: 5,
        nome: "Pedro Souza",
        cargo: "Mestre de Obras",
        periodo: "20/02/2023 - Atual",
        avatar: null,
      },
    ],
  },
  {
    obraId: 5,
    funcionarios: [
      {
        id: 2,
        nome: "Maria Oliveira",
        cargo: "Engenheira Civil",
        periodo: "15/04/2023 - Atual",
        avatar: "/confident-executive.png",
      },
      {
        id: 3,
        nome: "Carlos Santos",
        cargo: "Eletricista",
        periodo: "15/04/2023 - Atual",
        avatar: null,
      },
      {
        id: 4,
        nome: "Ana Pereira",
        cargo: "Arquiteta",
        periodo: "15/04/2023 - Atual",
        avatar: null,
      },
    ],
  },
]

// Função para obter funcionários de uma obra
const getFuncionariosObra = (obraId: number) => {
  const funcionariosObra = funcionariosObras.find((fo) => fo.obraId === obraId)
  return funcionariosObra ? funcionariosObra.funcionarios : []
}

// Função para calcular o percentual total de evolução da obra
const calcularEvolucaoTotal = (etapas: EtapaObra[]) => {
  // Cada etapa representa 20% do total
  const pesoEtapa = 20

  // Soma o progresso ponderado de cada etapa
  let evolucaoTotal = 0

  etapas.forEach((etapa) => {
    evolucaoTotal += (etapa.progresso / 100) * pesoEtapa
  })

  return Math.round(evolucaoTotal)
}

// Função para obter a cor da barra de progresso com base no percentual
const getProgressColor = (percentual: number) => {
  if (percentual < 25) return "bg-red-500"
  if (percentual < 50) return "bg-yellow-500"
  if (percentual < 75) return "bg-blue-500"
  return "bg-green-500"
}

// Função para obter o nome da etapa atual
const getEtapaAtual = (etapas: EtapaObra[]) => {
  // Encontra a primeira etapa não concluída
  const etapaAtual = etapas.find((etapa) => !etapa.concluida)

  // Se todas as etapas estiverem concluídas, retorna a última
  if (!etapaAtual) {
    return etapas[etapas.length - 1].nome
  }

  return etapaAtual.nome
}

export default function ObrasPage() {
  // Estado para pesquisa
  const [searchTerm, setSearchTerm] = useState("")

  // Estado para filtros
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string[]>([])
  const [filtroResponsavel, setFiltroResponsavel] = useState<string[]>([])
  const [filtroEtapa, setFiltroEtapa] = useState<string[]>([])

  // Estado para o diálogo de detalhes da obra
  const [detalhesDialogAberto, setDetalhesDialogAberto] = useState(false)
  const [obraSelecionada, setObraSelecionada] = useState<(typeof obras)[0] | null>(null)

  // Estado para o diálogo de edição da obra
  const [editarDialogAberto, setEditarDialogAberto] = useState(false)
  const [obraEditada, setObraEditada] = useState<(typeof obras)[0] | null>(null)

  // Estado para o diálogo de atualização da evolução
  const [evolucaoDialogAberto, setEvolucaoDialogAberto] = useState(false)
  const [obraEvolucao, setObraEvolucao] = useState<{ id: number; nome: string; etapas: EtapaObra[] } | null>(null)

  // Obter todos os responsáveis únicos
  const responsaveis = Array.from(new Set(obras.map((obra) => obra.responsavel))).sort()

  // Etapas disponíveis para filtro
  const etapasDisponiveis = ["Fundação", "Estrutura", "Alvenaria", "Instalação", "Acabamento"]

  // Função para filtrar obras
  const filtrarObras = () => {
    return obras.filter((obra) => {
      // Filtro por termo de pesquisa
      const matchesSearch =
        obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.endereco.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por status
      const matchesStatus = filtroStatus.length === 0 || filtroStatus.includes(obra.status)

      // Filtro por responsável
      const matchesResponsavel = filtroResponsavel.length === 0 || filtroResponsavel.includes(obra.responsavel)

      // Filtro por etapa atual
      const etapaAtual = getEtapaAtual(obra.etapas)
      const matchesEtapa = filtroEtapa.length === 0 || filtroEtapa.includes(etapaAtual)

      return matchesSearch && matchesStatus && matchesResponsavel && matchesEtapa
    })
  }

  // Obras filtradas
  const obrasFiltradas = filtrarObras()

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

  // Função para alternar seleção de responsável no filtro
  const toggleResponsavel = (responsavel: string) => {
    setFiltroResponsavel((current) => {
      if (current.includes(responsavel)) {
        return current.filter((r) => r !== responsavel)
      } else {
        return [...current, responsavel]
      }
    })
  }

  // Função para alternar seleção de etapa no filtro
  const toggleEtapa = (etapa: string) => {
    setFiltroEtapa((current) => {
      if (current.includes(etapa)) {
        return current.filter((e) => e !== etapa)
      } else {
        return [...current, etapa]
      }
    })
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroStatus([])
    setFiltroResponsavel([])
    setFiltroEtapa([])
    setSearchTerm("")
  }

  // Função para abrir o diálogo de detalhes da obra
  const abrirDialogoDetalhes = (obra: (typeof obras)[0]) => {
    setObraSelecionada(obra)
    setDetalhesDialogAberto(true)
  }

  // Função para abrir o diálogo de edição da obra
  const abrirDialogoEditar = (obra: (typeof obras)[0]) => {
    setObraEditada({ ...obra })
    setEditarDialogAberto(true)
  }

  // Função para abrir o diálogo de atualização da evolução
  const abrirDialogoEvolucao = (obra: (typeof obras)[0]) => {
    setObraEvolucao({
      id: obra.id,
      nome: obra.nome,
      etapas: JSON.parse(JSON.stringify(obra.etapas)),
    })
    setEvolucaoDialogAberto(true)
  }

  // Função para salvar edição da obra
  const salvarEdicaoObra = () => {
    if (!obraEditada) return

    // Validar campos
    if (!obraEditada.nome || !obraEditada.cliente || !obraEditada.endereco) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Fechar o diálogo
    setEditarDialogAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Obra Atualizada",
      description: `A obra ${obraEditada.nome} foi atualizada com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar o estado
    setObraEditada(null)
  }

  // Função para salvar a evolução da obra
  const salvarEvolucaoObra = () => {
    if (!obraEvolucao) return

    // Fechar o diálogo
    setEvolucaoDialogAberto(false)

    // Calcular o percentual total
    const percentualTotal = calcularEvolucaoTotal(obraEvolucao.etapas)

    // Mostrar toast de sucesso
    toast({
      title: "Evolução Atualizada",
      description: `A evolução da obra ${obraEvolucao.nome} foi atualizada para ${percentualTotal}%.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Limpar o estado
    setObraEvolucao(null)
  }

  // Função para atualizar o progresso de uma etapa
  const atualizarProgressoEtapa = (etapaId: string, progresso: number) => {
    if (!obraEvolucao) return

    const novasEtapas = obraEvolucao.etapas.map((etapa) => {
      if (etapa.id === etapaId) {
        return {
          ...etapa,
          progresso,
          concluida: progresso === 100,
        }
      }
      return etapa
    })

    setObraEvolucao({
      ...obraEvolucao,
      etapas: novasEtapas,
    })
  }

  // Função para marcar uma etapa como concluída
  const marcarEtapaConcluida = (etapaId: string, concluida: boolean) => {
    if (!obraEvolucao) return

    const novasEtapas = obraEvolucao.etapas.map((etapa) => {
      if (etapa.id === etapaId) {
        return {
          ...etapa,
          concluida,
          progresso: concluida ? 100 : etapa.progresso,
        }
      }
      return etapa
    })

    setObraEvolucao({
      ...obraEvolucao,
      etapas: novasEtapas,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Obras</h2>
        <Button asChild>
          <Link href="/dashboard/obras/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Obra
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
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
                  {["Concluída", "Em andamento"].map((status) => (
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Data de Início</TableHead>
              <TableHead>Data de Conclusão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Etapa Atual</TableHead>
              <TableHead>Evolução</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obrasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhuma obra encontrada.
                </TableCell>
              </TableRow>
            ) : (
              obrasFiltradas.map((obra) => {
                const evolucaoTotal = calcularEvolucaoTotal(obra.etapas)
                const etapaAtual = getEtapaAtual(obra.etapas)

                return (
                  <TableRow key={obra.id}>
                    <TableCell className="font-medium">{obra.nome}</TableCell>
                    <TableCell>{obra.cliente}</TableCell>
                    <TableCell>{obra.endereco}</TableCell>
                    <TableCell>{obra.dataInicio}</TableCell>
                    <TableCell>{obra.dataFim}</TableCell>
                    <TableCell>
                      <Badge variant={obra.status === "Concluída" ? "default" : "secondary"}>{obra.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {etapaAtual}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px]">
                          <Progress value={evolucaoTotal} className={getProgressColor(evolucaoTotal)} />
                        </div>
                        <span className="text-sm font-medium">{evolucaoTotal}%</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => abrirDialogoEvolucao(obra)}
                        >
                          <Percent className="h-4 w-4" />
                          <span className="sr-only">Atualizar evolução</span>
                        </Button>
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
                          <DropdownMenuItem onClick={() => abrirDialogoEditar(obra)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => abrirDialogoEvolucao(obra)}>
                            <Percent className="mr-2 h-4 w-4" />
                            Atualizar Evolução
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => abrirDialogoDetalhes(obra)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Detalhes
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
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de Detalhes da Obra */}
      <Dialog open={detalhesDialogAberto} onOpenChange={setDetalhesDialogAberto}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Obra</DialogTitle>
            <DialogDescription>{obraSelecionada?.nome}</DialogDescription>
          </DialogHeader>
          {obraSelecionada && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
                <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
                <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Cliente</h4>
                    <p>{obraSelecionada.cliente}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Responsável</h4>
                    <p>{obraSelecionada.responsavel}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Endereço</h4>
                    <p>{obraSelecionada.endereco}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Status</h4>
                    <Badge variant={obraSelecionada.status === "Concluída" ? "default" : "secondary"}>
                      {obraSelecionada.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Data de Início</h4>
                    <p>{obraSelecionada.dataInicio}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Data de Conclusão</h4>
                    <p>{obraSelecionada.dataFim}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{obraSelecionada.descricao}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evolucao" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Evolução da Obra</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Total: {calcularEvolucaoTotal(obraSelecionada.etapas)}%
                      </span>
                      <Button size="sm" variant="outline" onClick={() => abrirDialogoEvolucao(obraSelecionada)}>
                        <Percent className="mr-2 h-4 w-4" />
                        Atualizar Evolução
                      </Button>
                    </div>
                  </div>

                  <div className="h-4 mb-6">
                    <Progress
                      value={calcularEvolucaoTotal(obraSelecionada.etapas)}
                      className={getProgressColor(calcularEvolucaoTotal(obraSelecionada.etapas))}
                    />
                  </div>

                  <div className="space-y-4">
                    {obraSelecionada.etapas.map((etapa) => (
                      <div key={etapa.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{etapa.nome}</h4>
                            {etapa.concluida && (
                              <Badge variant="default" className="bg-green-500">
                                Concluída
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium">{etapa.progresso}%</span>
                        </div>
                        <Progress value={etapa.progresso} className={getProgressColor(etapa.progresso)} />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orcamentos" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Orçamentos da Obra</h3>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/orcamentos/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Orçamento
                    </Link>
                  </Button>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data de Emissão</TableHead>
                        <TableHead>Valor (R$)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obraSelecionada.orcamentos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Nenhum orçamento encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        obraSelecionada.orcamentos.map((orcamento) => (
                          <TableRow key={orcamento.id}>
                            <TableCell className="font-medium">{orcamento.numero}</TableCell>
                            <TableCell>{orcamento.dataEmissao}</TableCell>
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
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="fornecedores" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Fornecedores da Obra</h3>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/fornecedores/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Fornecedor
                    </Link>
                  </Button>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obraSelecionada.fornecedores.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum fornecedor encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        obraSelecionada.fornecedores.map((fornecedor) => (
                          <TableRow key={fornecedor.id}>
                            <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                            <TableCell>{fornecedor.tipo}</TableCell>
                            <TableCell>{fornecedor.contato}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/fornecedores/${fornecedor.id}/editar`}>
                                  <Building className="mr-2 h-4 w-4" />
                                  Ver Fornecedor
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="funcionarios" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Funcionários da Obra</h3>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/funcionarios/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Funcionário
                    </Link>
                  </Button>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFuncionariosObra(obraSelecionada.id).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum funcionário encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFuncionariosObra(obraSelecionada.id).map((funcionario) => (
                          <TableRow key={funcionario.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {funcionario.avatar ? (
                                    <AvatarImage
                                      src={funcionario.avatar || "/placeholder.svg"}
                                      alt={funcionario.nome}
                                    />
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
                                <span className="font-medium">{funcionario.nome}</span>
                              </div>
                            </TableCell>
                            <TableCell>{funcionario.cargo}</TableCell>
                            <TableCell>{funcionario.periodo}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/funcionarios/${funcionario.id}/editar`}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Ver Funcionário
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetalhesDialogAberto(false)}>
              Fechar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDetalhesDialogAberto(false)
                if (obraSelecionada) {
                  abrirDialogoEditar(obraSelecionada)
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Obra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição da Obra */}
      <Dialog open={editarDialogAberto} onOpenChange={setEditarDialogAberto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Obra</DialogTitle>
            <DialogDescription>Atualize os dados da obra.</DialogDescription>
          </DialogHeader>
          {obraEditada && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Obra</Label>
                <Input
                  id="nome"
                  value={obraEditada.nome}
                  onChange={(e) => setObraEditada({ ...obraEditada, nome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={obraEditada.cliente}
                    onChange={(e) => setObraEditada({ ...obraEditada, cliente: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={obraEditada.responsavel}
                    onChange={(e) => setObraEditada({ ...obraEditada, responsavel: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={obraEditada.endereco}
                  onChange={(e) => setObraEditada({ ...obraEditada, endereco: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={obraEditada.dataInicio.split("/").reverse().join("-")}
                    onChange={(e) => {
                      const date = e.target.value ? format(new Date(e.target.value), "dd/MM/yyyy") : ""
                      setObraEditada({ ...obraEditada, dataInicio: date })
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataFim">Data de Conclusão</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={obraEditada.dataFim.split("/").reverse().join("-")}
                    onChange={(e) => {
                      const date = e.target.value ? format(new Date(e.target.value), "dd/MM/yyyy") : ""
                      setObraEditada({ ...obraEditada, dataFim: date })
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={obraEditada.status}
                  onChange={(e) => setObraEditada({ ...obraEditada, status: e.target.value })}
                >
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={obraEditada.descricao}
                  onChange={(e) => setObraEditada({ ...obraEditada, descricao: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditarDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicaoObra}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Atualização da Evolução */}
      <Dialog open={evolucaoDialogAberto} onOpenChange={setEvolucaoDialogAberto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Atualizar Evolução da Obra</DialogTitle>
            <DialogDescription>Atualize o progresso de cada etapa da obra {obraEvolucao?.nome}.</DialogDescription>
          </DialogHeader>
          {obraEvolucao && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Evolução Total</h3>
                <span className="text-xl font-bold">{calcularEvolucaoTotal(obraEvolucao.etapas)}%</span>
              </div>
              <div className="h-4 mb-4">
                <Progress
                  value={calcularEvolucaoTotal(obraEvolucao.etapas)}
                  className={getProgressColor(calcularEvolucaoTotal(obraEvolucao.etapas))}
                />
              </div>

              <div className="space-y-6">
                {obraEvolucao.etapas.map((etapa) => (
                  <div key={etapa.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{etapa.nome}</h4>
                        <span className="text-sm text-muted-foreground">(20% da obra)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{etapa.progresso}%</span>
                        <Checkbox
                          id={`concluida-${etapa.id}`}
                          checked={etapa.concluida}
                          onCheckedChange={(checked) => marcarEtapaConcluida(etapa.id, checked === true)}
                        />
                        <Label htmlFor={`concluida-${etapa.id}`} className="text-sm">
                          Concluída
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={etapa.progresso}
                        onChange={(e) => atualizarProgressoEtapa(etapa.id, Number.parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarProgressoEtapa(etapa.id, 0)}
                          disabled={etapa.progresso === 0}
                        >
                          0%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarProgressoEtapa(etapa.id, 50)}
                          disabled={etapa.progresso === 50}
                        >
                          50%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarProgressoEtapa(etapa.id, 100)}
                          disabled={etapa.progresso === 100}
                        >
                          100%
                        </Button>
                      </div>
                    </div>

                    <div className="h-2 mt-2">
                      <Progress value={etapa.progresso} className={getProgressColor(etapa.progresso)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvolucaoDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEvolucaoObra}>Salvar Evolução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
