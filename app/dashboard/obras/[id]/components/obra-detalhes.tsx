'use client'

import { useTransition, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  Users,
  FileText,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  ExternalLink,
  Phone,
  Mail,
  DollarSign,
  MoreHorizontal
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { concluirProximaEtapa } from '@/app/actions/obra'
import {
  calcularEvolucao,
  obterEtapaAtual,
  obterProximaEtapa
} from '@/app/lib/obra-utils'
import { CronogramaTable } from '@/components/cronograma-table'
import {
  CriarCronogramaIndividual,
  CriarCronogramaLote
} from '@/components/cronograma-forms'
import { listarCronogramasAction } from '@/app/actions/cronograma'
import { CronogramaRecebimento } from '@/types/api-types'
import {
  getFuncionarios,
  type FuncionarioBase
} from '@/app/actions/funcionario'
import { alocarFuncionario } from '@/app/actions/obra'
import type { Obra } from '@/app/actions/obra'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface ObraDetalhesProps {
  obra: Obra
}

export function ObraDetalhes({ obra }: ObraDetalhesProps) {
  const [isPending, startTransition] = useTransition()
  const [cronogramas, setCronogramas] = useState<CronogramaRecebimento[]>([])
  const [cronogramaLoading, setCronogramaLoading] = useState(true)
  const [cronogramaIndividualOpen, setCronogramaIndividualOpen] =
    useState(false)

  // Estados para modal de adicionar funcionário
  const [adicionarFuncionarioOpen, setAdicionarFuncionarioOpen] =
    useState(false)
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState<
    FuncionarioBase[]
  >([])
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState<
    string[]
  >([])
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false)
  const [salvandoAlocacao, setSalvandoAlocacao] = useState(false)

  const evolucao = calcularEvolucao(obra.etapas)
  const etapaAtual = obterEtapaAtual(obra.etapas)
  const proximaEtapa = obterProximaEtapa(obra.etapas)

  // Obter dados relacionados
  const funcionariosObra = obra.funcionarios

  // Carregar cronogramas
  const carregarCronogramas = async () => {
    setCronogramaLoading(true)
    try {
      const result = await listarCronogramasAction(obra.id)

      if (result.success) {
        if (Array.isArray(result.data)) {
          setCronogramas(result.data)
        }
      }
    } catch (error) {
      console.error('💥 Erro ao carregar cronogramas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os cronogramas',
        variant: 'destructive'
      })
    } finally {
      setCronogramaLoading(false)
    }
  }

  // Carregar funcionários disponíveis
  const carregarFuncionarios = async () => {
    setLoadingFuncionarios(true)
    try {
      console.log('🔍 Carregando funcionários disponíveis...')
      const result = await getFuncionarios()

      if (Array.isArray(result)) {
        // Filtrar funcionários que não estão alocados nesta obra
        const funcionariosAlocados = obra.funcionarios.map(f =>
          f.funcionarioId.toString()
        )
        const funcionariosNaoAlocados = result.filter(
          f => f.id && !funcionariosAlocados.includes(f.id.toString())
        )
        setFuncionariosDisponiveis(funcionariosNaoAlocados)
      } else {
        console.log('❌ Erro ao carregar funcionários:', result.error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os funcionários',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('💥 Erro ao carregar funcionários:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar funcionários',
        variant: 'destructive'
      })
    } finally {
      setLoadingFuncionarios(false)
    }
  }

  // Alocar funcionários à obra
  const handleAlocarFuncionarios = async () => {
    if (funcionariosSelecionados.length === 0) return

    setSalvandoAlocacao(true)
    try {
      console.log('🔄 Alocando funcionários:', funcionariosSelecionados)
      const result = await alocarFuncionario(obra.id, funcionariosSelecionados)

      if (result?.success) {
        toast({
          title: 'Sucesso',
          description: `${funcionariosSelecionados.length} funcionário(s) alocado(s) com sucesso!`
        })

        // Resetar estados do modal
        setAdicionarFuncionarioOpen(false)
        setFuncionariosSelecionados([])

        // Recarregar a página para mostrar os novos funcionários
        window.location.reload()
      } else {
        toast({
          title: 'Erro',
          description: result?.message || 'Erro ao alocar funcionários',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('💥 Erro ao alocar funcionários:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao alocar funcionários',
        variant: 'destructive'
      })
    } finally {
      setSalvandoAlocacao(false)
    }
  }

  // Abrir modal e carregar funcionários
  const abrirModalAdicionarFuncionario = () => {
    setAdicionarFuncionarioOpen(true)
    carregarFuncionarios()
  }

  // Toggle seleção de funcionário
  const toggleFuncionarioSelecionado = (funcionarioId: string) => {
    setFuncionariosSelecionados(prev =>
      prev.includes(funcionarioId)
        ? prev.filter(id => id !== funcionarioId)
        : [...prev, funcionarioId]
    )
  }

  useEffect(() => {
    console.log('🔄 useEffect executado para obra.id:', obra.id)
    carregarCronogramas()
  }, [obra.id])

  const handleConcluirEtapa = (etapaId: string) => {
    startTransition(async () => {
      const result = await concluirProximaEtapa(obra.id)

      if (result.success) {
        toast({
          title: 'Etapa concluída',
          description: 'A etapa foi marcada como concluída com sucesso.'
        })
      } else {
        toast({
          title: 'Erro',
          description: result.error,
          variant: 'destructive'
        })
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-500'
      case 'Em andamento':
        return 'bg-blue-500'
      case 'Pausada':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOrcamentoStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-500'
      case 'Aprovado':
        return 'bg-blue-500'
      case 'Pendente':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/obras">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {obra.nome}
            </h1>
            <p className="text-muted-foreground">{obra.cliente}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/obras/${obra.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Obra
            </Link>
          </Button>
          {proximaEtapa && (
            <Button
              onClick={() => handleConcluirEtapa(proximaEtapa.id)}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isPending ? 'Concluindo...' : `Concluir ${proximaEtapa.nome}`}
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(obra.status)}>{obra.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evolução</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evolucao}%</div>
            <Progress value={evolucao} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapa Atual</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{etapaAtual}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funcionariosObra.length}</div>
            <p className="text-xs text-muted-foreground">alocados</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informações da Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Endereço
              </div>
              <p>{obra.endereco}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Período
              </div>
              <p>
                {new Date(obra.dataInicio).toLocaleDateString()} -{' '}
                {new Date(obra.dataFim).toLocaleDateString()}
              </p>
            </div>
            {obra.descricao && (
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Descrição
                </div>
                <p className="text-sm">{obra.descricao}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="etapas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>

        {/* Tab Etapas */}
        <TabsContent value="etapas">
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Etapas</CardTitle>
              <CardDescription>
                Acompanhe o progresso de cada etapa da obra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {obra.etapas.map((etapa, index) => (
                  <div
                    key={etapa.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          etapa.concluida
                            ? 'bg-green-500 text-white'
                            : index === 0 || obra.etapas[index - 1]?.concluida
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {etapa.concluida ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{etapa.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {etapa.concluida ? 'Concluída' : 'Pendente'} • 20% da
                          obra
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {etapa.concluida ? (
                        <Badge className="bg-green-500">Concluída</Badge>
                      ) : index === 0 || obra.etapas[index - 1]?.concluida ? (
                        <Button
                          size="sm"
                          onClick={() => handleConcluirEtapa(etapa.id)}
                          disabled={isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Concluir
                        </Button>
                      ) : (
                        <Badge variant="secondary">Aguardando</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cronograma de Recebimento */}
        <TabsContent value="cronograma">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cronograma de Recebimento</CardTitle>
                <CardDescription>
                  Controle dos recebimentos por etapa da obra
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Cronograma
                      <MoreHorizontal className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setCronogramaIndividualOpen(true)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Etapa Individual
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {cronogramaLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Carregando cronograma...
                    </p>
                  </div>
                </div>
              ) : (
                <CronogramaTable
                  cronogramas={cronogramas}
                  onUpdate={carregarCronogramas}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Funcionários */}
        <TabsContent value="funcionarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Funcionários Alocados</CardTitle>
                <CardDescription>Equipe trabalhando nesta obra</CardDescription>
              </div>
              <Button size="sm" onClick={abrirModalAdicionarFuncionario}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funcionariosObra.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum funcionário alocado nesta obra.
                  </p>
                ) : (
                  funcionariosObra.map(funcionario => (
                    <div
                      key={funcionario.funcionarioId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={'/placeholder.svg'}
                            alt={funcionario.nomeFuncionario}
                          />
                          <AvatarFallback>
                            {funcionario.nomeFuncionario
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {funcionario.nomeFuncionario}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {funcionario.telefone}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {funcionario.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/funcionarios/${funcionario.funcionarioId}/editar`}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Orçamentos */}
        <TabsContent value="orcamentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Orçamentos</CardTitle>
                <CardDescription>
                  Orçamentos relacionados a esta obra
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/orcamentos/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Orçamento
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obra.orcamentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Nenhum orçamento encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      obra.orcamentos.map(orcamento => (
                        <TableRow key={orcamento.id}>
                          <TableCell className="font-medium">
                            {orcamento.numero}
                          </TableCell>
                          <TableCell className="font-medium">
                            R${' '}
                            {orcamento.valorTotal.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getOrcamentoStatusColor(
                                orcamento.status
                              )}
                            >
                              {orcamento.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/dashboard/orcamentos/${orcamento.id}`}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Fornecedores */}
        <TabsContent value="fornecedores">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fornecedores</CardTitle>
                <CardDescription>
                  Fornecedores envolvidos nesta obra
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/fornecedores/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Fornecedor
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {obra.fornecedores.map(fornecedor => (
                  <div
                    key={fornecedor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{fornecedor.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {fornecedor.tipo}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {fornecedor.telefone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {fornecedor.email}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {fornecedor.endereco}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/fornecedores/${fornecedor.id}/editar`}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Materiais */}
        <TabsContent value="materiais">
          <Card>
            <CardHeader>
              <CardTitle>Materiais</CardTitle>
              <CardDescription>Materiais utilizados nesta obra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obra.produtos.map(material => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{material.nome}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar funcionários */}
      <Dialog
        open={adicionarFuncionarioOpen}
        onOpenChange={setAdicionarFuncionarioOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionários</DialogTitle>
            <DialogDescription>
              Selecione os funcionários que deseja alocar na obra "{obra.nome}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingFuncionarios ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Carregando funcionários...
                  </p>
                </div>
              </div>
            ) : funcionariosDisponiveis.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  Nenhum funcionário disponível
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Todos os funcionários já estão alocados nesta obra ou não há
                  funcionários cadastrados.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Funcionários Disponíveis</Label>
                <ScrollArea className="h-64 border rounded-md p-4">
                  <div className="space-y-3">
                    {funcionariosDisponiveis.map(funcionario => (
                      <div
                        key={funcionario.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer border"
                        onClick={() =>
                          funcionario.id &&
                          toggleFuncionarioSelecionado(funcionario.id)
                        }
                      >
                        <Checkbox
                          checked={
                            funcionario.id
                              ? funcionariosSelecionados.includes(
                                  funcionario.id
                                )
                              : false
                          }
                          onCheckedChange={() =>
                            funcionario.id &&
                            toggleFuncionarioSelecionado(funcionario.id)
                          }
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {funcionario.nome
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{funcionario.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {funcionario.cargo || 'Cargo não informado'}
                          </div>
                          {funcionario.telefone && (
                            <div className="text-xs text-muted-foreground">
                              📞 {funcionario.telefone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {funcionariosSelecionados.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {funcionariosSelecionados.length} funcionário(s)
                    selecionado(s)
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdicionarFuncionarioOpen(false)
                setFuncionariosSelecionados([])
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAlocarFuncionarios}
              disabled={
                funcionariosSelecionados.length === 0 || salvandoAlocacao
              }
            >
              {salvandoAlocacao ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Alocando...
                </>
              ) : (
                `Alocar ${
                  funcionariosSelecionados.length > 0
                    ? `(${funcionariosSelecionados.length})`
                    : ''
                }`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs para cronograma */}
      <CriarCronogramaIndividual
        open={cronogramaIndividualOpen}
        onOpenChange={setCronogramaIndividualOpen}
        obraId={obra.id}
        onSuccess={carregarCronogramas}
      />
    </div>
  )
}
