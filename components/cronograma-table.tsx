"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { MoreHorizontal, CheckCircle, DollarSign, Trash2, Edit } from "lucide-react"
import { CronogramaRecebimento } from "@/types/api-types"
import { marcarComoRecebidoAction, excluirCronogramaAction } from "@/app/actions/cronograma"

interface CronogramaTableProps {
  cronogramas: CronogramaRecebimento[]
  onUpdate: () => void
}

export function CronogramaTable({ cronogramas, onUpdate }: CronogramaTableProps) {
  const [marcarRecebidoDialog, setMarcarRecebidoDialog] = useState(false)
  const [cronogramaSelecionado, setCronogramaSelecionado] = useState<CronogramaRecebimento | null>(null)
  const [valorRecebido, setValorRecebido] = useState("")
  const [dataRecebimento, setDataRecebimento] = useState(format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(false)

  console.log('📋 CronogramaTable recebeu:', cronogramas?.length || 0, 'cronogramas')
  console.log('📊 Dados dos cronogramas:', cronogramas)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  const getStatusBadge = (status: string, estaVencido: boolean) => {
    if (status === "RECEBIDO") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Recebido
        </Badge>
      )
    }
    
    if (estaVencido) {
      return (
        <Badge variant="destructive">
          Vencido
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline">
        Pendente
      </Badge>
    )
  }

  const handleMarcarRecebido = async () => {
    if (!cronogramaSelecionado || !valorRecebido) return

    setLoading(true)
    try {
      const result = await marcarComoRecebidoAction(
        cronogramaSelecionado.id,
        parseFloat(valorRecebido),
        dataRecebimento
      )
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Etapa marcada como recebida com sucesso!",
        })
        
        setMarcarRecebidoDialog(false)
        setValorRecebido("")
        setCronogramaSelecionado(null)
        onUpdate()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao marcar etapa como recebida",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar etapa como recebida",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async (cronograma: CronogramaRecebimento) => {
    if (!confirm(`Tem certeza que deseja excluir a etapa "${cronograma.descricaoEtapa}"?`)) return

    try {
      const result = await excluirCronogramaAction(cronograma.id)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Etapa excluída com sucesso!",
        })
        
        onUpdate()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao excluir etapa",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir etapa",
        variant: "destructive",
      })
    }
  }

  const abrirMarcarRecebido = (cronograma: CronogramaRecebimento) => {
    setCronogramaSelecionado(cronograma)
    setValorRecebido(cronograma.valorSaldo.toString())
    setMarcarRecebidoDialog(true)
  }

  if (cronogramas.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Nenhum cronograma cadastrado</h3>
        <p className="mt-2 text-muted-foreground">
          Comece criando um cronograma de recebimento para esta obra.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Etapa</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor Previsto</TableHead>
              <TableHead>Valor Recebido</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cronogramas.map((cronograma) => (
              <TableRow key={cronograma.id}>
                <TableCell className="font-medium">
                  Etapa {cronograma.numeroEtapa}
                </TableCell>
                <TableCell>{cronograma.descricaoEtapa}</TableCell>
                <TableCell>{formatCurrency(cronograma.valorPrevisto)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{formatCurrency(cronograma.valorRecebido)}</div>
                    {cronograma.percentualRecebido > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {cronograma.percentualRecebido.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(cronograma.valorSaldo)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{formatDate(cronograma.dataVencimento)}</div>
                    {cronograma.dataRecebimento && (
                      <div className="text-xs text-green-600">
                        Recebido: {formatDate(cronograma.dataRecebimento)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(cronograma.status, cronograma.estaVencido)}
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
                      {cronograma.status === "PENDENTE" && (
                        <DropdownMenuItem onClick={() => abrirMarcarRecebido(cronograma)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Recebido
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleExcluir(cronograma)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para marcar como recebido */}
      <Dialog open={marcarRecebidoDialog} onOpenChange={setMarcarRecebidoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Recebido</DialogTitle>
            <DialogDescription>
              Confirme o recebimento da etapa "{cronogramaSelecionado?.descricaoEtapa}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor-recebido" className="text-right">
                Valor Recebido
              </Label>
              <Input
                id="valor-recebido"
                type="number"
                step="0.01"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                className="col-span-3"
                placeholder="0,00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data-recebimento" className="text-right">
                Data Recebimento
              </Label>
              <Input
                id="data-recebimento"
                type="date"
                value={dataRecebimento}
                onChange={(e) => setDataRecebimento(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarcarRecebidoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarcarRecebido} disabled={loading || !valorRecebido}>
              {loading ? "Processando..." : "Confirmar Recebimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}