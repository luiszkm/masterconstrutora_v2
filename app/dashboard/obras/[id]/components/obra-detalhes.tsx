"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  User,
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
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { concluirEtapa } from "@/app/actions/obra"
import { calcularEvolucao, obterEtapaAtual, obterProximaEtapa } from "@/app/lib/obra-utils"
import type { Obra } from "@/app/actions/obra"

// Dados mockados para relacionamentos


const orcamentosMock = [
  {
    id: 1,
    numero: "ORC-2024-001",
    descricao: "Material para fundação",
    valor: 125000.0,
    dataEmissao: "2024-03-01",
    status: "Aprovado",
  },
  {
    id: 2,
    numero: "ORC-2024-002",
    descricao: "Material para estrutura",
    valor: 85000.0,
    dataEmissao: "2024-04-15",
    status: "Pago",
  },
  {
    id: 3,
    numero: "ORC-2024-003",
    descricao: "Material para acabamento",
    valor: 65000.0,
    dataEmissao: "2024-06-01",
    status: "Pendente",
  },
]

const fornecedoresMock = [
  {
    id: 1,
    nome: "Materiais Premium Ltda",
    tipo: "Materiais de Construção",
    telefone: "(11) 98765-4321",
    email: "contato@materiaisPremium.com",
    endereco: "Rua das Construções, 123",
  },
  {
    id: 2,
    nome: "Mármores & Granitos SA",
    tipo: "Acabamentos",
    telefone: "(11) 91234-5678",
    email: "vendas@marmoresgranitos.com",
    endereco: "Av. dos Mármores, 456",
  },
  {
    id: 3,
    nome: "Elétrica Total",
    tipo: "Instalações Elétricas",
    telefone: "(13) 98888-7777",
    email: "eletrica@total.com",
    endereco: "Rua da Energia, 789",
  },
]

const materiaisMock = [
  {
    id: 1,
    nome: "Cimento CP-II 50kg",
    categoria: "Básicos",
    quantidade: 200,
    unidade: "sacos",
    valorUnitario: 32.5,
    fornecedor: "Materiais Premium Ltda",
  },
  {
    id: 2,
    nome: "Tijolo Cerâmico 6 furos",
    categoria: "Alvenaria",
    quantidade: 15000,
    unidade: "unidades",
    valorUnitario: 0.85,
    fornecedor: "Materiais Premium Ltda",
  },
  {
    id: 3,
    nome: "Mármore Carrara",
    categoria: "Acabamento",
    quantidade: 45,
    unidade: "m²",
    valorUnitario: 180.0,
    fornecedor: "Mármores & Granitos SA",
  },
  {
    id: 4,
    nome: "Fio Elétrico 2,5mm",
    categoria: "Elétrica",
    quantidade: 500,
    unidade: "metros",
    valorUnitario: 4.2,
    fornecedor: "Elétrica Total",
  },
]

interface ObraDetalhesProps {
  obra: Obra
}

export function ObraDetalhes({ obra }: ObraDetalhesProps) {
  const [isPending, startTransition] = useTransition()

  const evolucao = calcularEvolucao(obra.etapas)
  const etapaAtual = obterEtapaAtual(obra.etapas)
  const proximaEtapa = obterProximaEtapa(obra.etapas)

  // Obter dados relacionados
  const funcionariosObra = obra.funcionarios.filter((f) => obra.funcionarios.includes(f.id))
  const orcamentosObra = orcamentosMock.filter((o) => obra.orcamentos.includes(o.id))
  const fornecedoresObra = fornecedoresMock.slice(0, 3) // Mock: primeiros 3 fornecedores
  const materiaisObra = materiaisMock // Mock: todos os materiais

  const handleConcluirEtapa = (etapaId: string) => {
    startTransition(async () => {
      const result = await concluirEtapa(obra.id, etapaId)

      if (result.success) {
        toast({
          title: "Etapa concluída",
          description: "A etapa foi marcada como concluída com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-500"
      case "Em andamento":
        return "bg-blue-500"
      case "Pausada":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOrcamentoStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-green-500"
      case "Aprovado":
        return "bg-blue-500"
      case "Pendente":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{obra.nome}</h1>
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
              {isPending ? "Concluindo..." : `Concluir ${proximaEtapa.nome}`}
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
                {new Date(obra.dataInicio).toLocaleDateString()} - {new Date(obra.dataFim).toLocaleDateString()}
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
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
              <CardDescription>Acompanhe o progresso de cada etapa da obra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {obra.etapas.map((etapa, index) => (
                  <div key={etapa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          etapa.concluida
                            ? "bg-green-500 text-white"
                            : index === 0 || obra.etapas[index - 1]?.concluida
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {etapa.concluida ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{etapa.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {etapa.concluida ? "Concluída" : "Pendente"} • 20% da obra
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

        {/* Tab Funcionários */}
        <TabsContent value="funcionarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Funcionários Alocados</CardTitle>
                <CardDescription>Equipe trabalhando nesta obra</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/funcionarios/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funcionariosObra.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum funcionário alocado nesta obra.</p>
                ) : (
                  funcionariosObra.map((funcionario) => (
                    <div key={funcionario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={funcionario.avatar || "/placeholder.svg"} alt={funcionario.nome} />
                          <AvatarFallback>
                            {funcionario.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{funcionario.nome}</h3>
                          <p className="text-sm text-muted-foreground">{funcionario.cargo}</p>
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
                        <Link href={`/dashboard/funcionarios/${funcionario.id}/editar`}>
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
                <CardDescription>Orçamentos relacionados a esta obra</CardDescription>
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
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentosObra.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Nenhum orçamento encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orcamentosObra.map((orcamento) => (
                        <TableRow key={orcamento.id}>
                          <TableCell className="font-medium">{orcamento.numero}</TableCell>
                          <TableCell>{orcamento.descricao}</TableCell>
                          <TableCell className="font-medium">
                            R$ {orcamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{new Date(orcamento.dataEmissao).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={getOrcamentoStatusColor(orcamento.status)}>{orcamento.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/orcamentos/${orcamento.id}`}>
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
                <CardDescription>Fornecedores envolvidos nesta obra</CardDescription>
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
                {fornecedoresObra.map((fornecedor) => (
                  <div key={fornecedor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{fornecedor.nome}</h3>
                        <p className="text-sm text-muted-foreground">{fornecedor.tipo}</p>
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
                        <p className="text-xs text-muted-foreground mt-1">{fornecedor.endereco}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/fornecedores/${fornecedor.id}/editar`}>
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
                      <TableHead>Categoria</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fornecedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiaisObra.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{material.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{material.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          {material.quantidade} {material.unidade}
                        </TableCell>
                        <TableCell>
                          R$ {material.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-medium">
                          R${" "}
                          {(material.quantidade * material.valorUnitario).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{material.fornecedor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
