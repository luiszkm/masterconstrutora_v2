'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Building,
  User,
  Calendar,
  DollarSign,
  Package,
  Layers,
  FileText,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { deleteOrcamento, updateOrcamentoStatus } from '@/app/actions/orcamento'
import type { OrcamentoDetalhado } from '@/types/orcamento'
import { formatarData, formatarValor } from '@/app/utils/mask'

interface OrcamentoDetalhesClientProps {
  orcamento: OrcamentoDetalhado
}

export function OrcamentoDetalhesClient({
  orcamento: initialOrcamento
}: OrcamentoDetalhesClientProps) {
  const router = useRouter()
  const [orcamento, setOrcamento] =
    useState<OrcamentoDetalhado>(initialOrcamento)
  const [isPending, startTransition] = useTransition()

  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<
    'Em Aberto' | 'Aprovado' | 'Rejeitado' | 'Cancelado'
  >(orcamento.status)

  // Função para renderizar badge de status
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      'Em Aberto': {
        variant: 'outline' as const,
        icon: Clock,
        color: 'text-yellow-600'
      },
      Aprovado: {
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600'
      },
      Rejeitado: {
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600'
      },
      Cancelado: {
        variant: 'secondary' as const,
        icon: Ban,
        color: 'text-gray-600'
      }
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig['Em Aberto']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  // Função para copiar ID
  const copiarId = (id: string, tipo: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: 'ID copiado',
      description: `${tipo} copiado para a área de transferência`
    })
  }

  // Função para excluir orçamento
  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteOrcamento(orcamento.id)

      if (result.success) {
        toast({
          title: 'Orçamento excluído',
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>
        })
        router.push('/dashboard/orcamentos')
      } else {
        toast({
          title: 'Erro ao excluir orçamento',
          description: result.message,
          variant: 'destructive'
        })
      }

      setDeleteDialogOpen(false)
    })
  }

  // Função para atualizar status
  const handleUpdateStatus = async () => {
    startTransition(async () => {
      const result = await updateOrcamentoStatus(orcamento.id, newStatus)

      if (result.success) {
        toast({
          title: 'Status atualizado',
          description: result.message,
          action: <ToastAction altText="Fechar">Fechar</ToastAction>
        })

        // Atualizar estado local
        setOrcamento(prev => ({ ...prev, status: newStatus }))
      } else {
        toast({
          title: 'Erro ao atualizar status',
          description: result.message,
          variant: 'destructive'
        })
      }

      setStatusDialogOpen(false)
    })
  }

  // Calcular estatísticas dos itens
  const stats = {
    totalItens: orcamento.itens.length,
    quantidadeTotal: orcamento.itens.reduce(
      (total, item) => total + item.Quantidade,
      0
    ),
    valorMedio:
      orcamento.itens.length > 0
        ? orcamento.valorTotal / orcamento.itens.length
        : 0,
    itemMaisCaro: orcamento.itens.reduce(
      (max, item) => (item.ValorUnitario > max.ValorUnitario ? item : max),
      orcamento.itens[0] || { ValorUnitario: 0 }
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orcamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {orcamento.numero}
              </h2>
              {renderStatusBadge(orcamento.status)}
            </div>
            <p className="text-muted-foreground">Detalhes do orçamento</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewStatus(orcamento.status)
              setStatusDialogOpen(true)
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Alterar Status
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Orçamento */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Número
                </Label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    {orcamento.numero}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copiarId(orcamento.numero, 'Número do orçamento')
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Data de Emissão
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatarData(orcamento.dataEmissao)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-green-600">
                    {formatarValor(orcamento.valorTotal)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalItens}</div>
              <div className="text-sm text-muted-foreground">
                Total de Itens
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.quantidadeTotal}</div>
              <div className="text-sm text-muted-foreground">
                Quantidade Total
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatarValor(stats.valorMedio)}
              </div>
              <div className="text-sm text-muted-foreground">
                Valor Médio por Item
              </div>
            </div>
            {stats.itemMaisCaro.ValorUnitario > 0 && (
              <>
                <Separator />
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {formatarValor(stats.itemMaisCaro.ValorUnitario)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Item Mais Caro
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Relacionadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Obra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Obra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Nome
              </Label>
              <p className="font-medium">{orcamento.obra.nome}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              asChild
            >
              <Link href={`/dashboard/obras/${orcamento.obra.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Obra
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Etapa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Etapa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Nome
              </Label>
              <p className="font-medium">{orcamento.etapa.nome}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              asChild
            >
              <Link href={`/dashboard/etapas/${orcamento.etapa.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Etapa
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Fornecedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Nome
              </Label>
              <p className="font-medium">{orcamento.fornecedor.nome}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              asChild
            >
              <Link href={`/dashboard/fornecedores/${orcamento.fornecedor.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Fornecedor
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Itens do Orçamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Itens do Orçamento ({orcamento.itens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orcamento.itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum item encontrado</p>
              <p className="text-muted-foreground">
                Este orçamento não possui itens cadastrados.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[50px]">#</TableHead>
                      <TableHead className="min-w-[200px]">Produto</TableHead>
                      <TableHead className="min-w-[120px]">Categoria</TableHead>
                      <TableHead className="min-w-[100px]">Unidade</TableHead>
                      <TableHead className="text-center min-w-[100px]">
                        Quantidade
                      </TableHead>
                      <TableHead className="text-right min-w-[120px]">
                        Valor Unitário
                      </TableHead>
                      <TableHead className="text-right min-w-[120px]">
                        Valor Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamento.itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.ProdutoNome || (
                                <span className="text-muted-foreground italic">
                                  Sem nome
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.Categoria ? (
                            <Badge variant="outline">{item.Categoria}</Badge>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Sem categoria
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.UnidadeDeMedida ? (
                            <Badge variant="secondary">
                              {item.UnidadeDeMedida}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Sem unidade
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {item.Quantidade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatarValor(item.ValorUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {formatarValor(item.Quantidade * item.ValorUnitario)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Total */}
          {orcamento.itens.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">
                    Total do Orçamento:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatarValor(orcamento.valorTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o orçamento "{orcamento.numero}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status do Orçamento</DialogTitle>
            <DialogDescription>
              Altere o status do orçamento "{orcamento.numero}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Novo Status</Label>
              <Select
                value={newStatus}
                onValueChange={value =>
                  setNewStatus(
                    value as
                      | 'Em Aberto'
                      | 'Aprovado'
                      | 'Rejeitado'
                      | 'Cancelado'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
