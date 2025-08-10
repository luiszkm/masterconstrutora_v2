"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/app/lib/utils"
import { BanknoteIcon as BankIcon, Calendar, CheckCircle2, ChevronDown, CircleDollarSign, CreditCard, DollarSign, Filter, MoreHorizontal, RefreshCcw, Search, X } from 'lucide-react'
import { getFluxoDeCaixa, registrarPagamento, registrarRecebimento } from "@/app/actions/financneiro"
import type { ContaPagar, ContaReceber, FluxoCaixaResponse } from "@/types/financeiro"

const statusColors: Record<string, string> = {
  PENDENTE: "bg-yellow-500",
  PARCIAL: "bg-amber-500",
  RECEBIDO: "bg-green-600",
  PAGO: "bg-green-600",
  VENCIDO: "bg-red-600",
  CANCELADO: "bg-gray-500",
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("pt-BR")
}

type Props = {
  initialReceber: ContaReceber[]
  initialPagar: ContaPagar[]
  initialVencidasReceber: ContaReceber[]
  initialVencidasPagar: ContaPagar[]
  initialFluxo: FluxoCaixaResponse | null
  defaultDataInicio: string
  defaultDataFim: string
}

export function FinanceiroClient({
  initialReceber,
  initialPagar,
  initialVencidasReceber,
  initialVencidasPagar,
  initialFluxo,
  defaultDataInicio,
  defaultDataFim,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [tab, setTab] = useState("visao-geral")

  // Estados locais com dados iniciais vindos do servidor
  const [contasReceber] = useState<ContaReceber[]>(initialReceber)
  const [contasPagar] = useState<ContaPagar[]>(initialPagar)
  const [vencidasReceber] = useState<ContaReceber[]>(initialVencidasReceber)
  const [vencidasPagar] = useState<ContaPagar[]>(initialVencidasPagar)
  const [fluxo, setFluxo] = useState<FluxoCaixaResponse | null>(initialFluxo)

  // Filtros
  const [buscaReceber, setBuscaReceber] = useState("")
  const [buscaPagar, setBuscaPagar] = useState("")
  const [statusFilterReceber, setStatusFilterReceber] = useState<ContaReceber["status"] | "">("")
  const [statusFilterPagar, setStatusFilterPagar] = useState<ContaPagar["status"] | "">("")

  // Período do fluxo
  const [dataInicio, setDataInicio] = useState(defaultDataInicio)
  const [dataFim, setDataFim] = useState(defaultDataFim)

  // Dialogs
  const [dialogReceberOpen, setDialogReceberOpen] = useState(false)
  const [contaReceberSel, setContaReceberSel] = useState<ContaReceber | null>(null)
  const [valorReceb, setValorReceb] = useState<number>(0)
  const [formaReceb, setFormaReceb] = useState("")
  const [obsReceb, setObsReceb] = useState("")
  const [contaBancReceb, setContaBancReceb] = useState("")

  const [dialogPagarOpen, setDialogPagarOpen] = useState(false)
  const [contaPagarSel, setContaPagarSel] = useState<ContaPagar | null>(null)
  const [valorPag, setValorPag] = useState<number>(0)
  const [formaPag, setFormaPag] = useState("")
  const [obsPag, setObsPag] = useState("")
  const [contaBancPag, setContaBancPag] = useState("")

  const totalAReceber = contasReceber.reduce((acc, c) => acc + (c.valorOriginal - c.valorRecebido), 0)

  // total a pagar nao deve considerar o status cancelado
  const totalAPagar = contasPagar.reduce((acc, c) => {
    if (c.status !== "CANCELADO") {
      return acc + (c.valorOriginal - c.valorPago)
    }
    return acc
  }, 0)

  const contasReceberFiltradas = useMemo(() => {
    return contasReceber.filter((c) => {
      const q = buscaReceber.toLowerCase()
      const matchesBusca =
        c.cliente.toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q) ||
        (c.numeroDocumento || "").toLowerCase().includes(q)
      const matchesStatus = !statusFilterReceber || c.status === statusFilterReceber
      return matchesBusca && matchesStatus
    })
  }, [contasReceber, buscaReceber, statusFilterReceber])

  const contasPagarFiltradas = useMemo(() => {
    return contasPagar.filter((c) => {
      const q = buscaPagar.toLowerCase()
      const matchesBusca =
        (c.fornecedorNome || "").toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q) ||
        (c.numeroDocumento || "").toLowerCase().includes(q)
      const matchesStatus = !statusFilterPagar || c.status === statusFilterPagar
      return matchesBusca && matchesStatus
    })
  }, [contasPagar, buscaPagar, statusFilterPagar])

  function openReceber(conta: ContaReceber) {
    setContaReceberSel(conta)
    const saldo = Math.max(0, conta.valorOriginal - conta.valorRecebido)
    setValorReceb(saldo)
    setFormaReceb("")
    setObsReceb("")
    setContaBancReceb("")
    setDialogReceberOpen(true)
  }

  function openPagar(conta: ContaPagar) {
    setContaPagarSel(conta)
    const saldo = Math.max(0, conta.valorOriginal - conta.valorPago)
    setValorPag(saldo)
    setFormaPag("")
    setObsPag("")
    setContaBancPag("")
    setDialogPagarOpen(true)
  }

  function doRegistrarRecebimento() {
    if (!contaReceberSel) return
    startTransition(async () => {
      const res = await registrarRecebimento({
        contaId: contaReceberSel.id,
        valor: valorReceb,
        formaPagamento: formaReceb || undefined,
        observacoes: obsReceb || undefined,
        contaBancariaId: contaBancReceb || undefined,
      })
      if (res.success) {
        toast({ title: "Sucesso", description: res.message })
        setDialogReceberOpen(false)
        router.refresh()
      } else {
        toast({ title: "Falha", description: res.message, variant: "destructive" })
      }
    })
  }

  function doRegistrarPagamento() {
    if (!contaPagarSel) return
    startTransition(async () => {
      const res = await registrarPagamento({
        contaId: contaPagarSel.id,
        valor: valorPag,
        formaPagamento: formaPag || undefined,
        observacoes: obsPag || undefined,
        contaBancariaId: contaBancPag || undefined,
      })
      if (res.success) {
        toast({ title: "Sucesso", description: res.message })
        setDialogPagarOpen(false)
        router.refresh()
      } else {
        toast({ title: "Falha", description: res.message, variant: "destructive" })
      }
    })
  }

  function recarregarFluxo() {
    startTransition(async () => {
      const res = await getFluxoDeCaixa({ dataInicio, dataFim })
      if ("error" in (res as any)) {
        toast({ title: "Erro ao obter fluxo", description: (res as any).error, variant: "destructive" })
      } else {
        setFluxo(res as FluxoCaixaResponse)
      }
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
        <Button variant="outline" onClick={() => router.refresh()} disabled={isPending} className="gap-2">
          <RefreshCcw className={cn("h-4 w-4", isPending && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAReceber)}</div>
            <p className="text-xs text-muted-foreground">Saldo de contas a receber (lista atual)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAPagar)}</div>
            <p className="text-xs text-muted-foreground">Saldo de contas a pagar (lista atual)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Fluxo de Caixa</CardTitle>
            <BankIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(fluxo?.saldoAtual ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Entradas: {formatCurrency(fluxo?.totalEntradas ?? 0)} · Saídas: {formatCurrency(fluxo?.totalSaidas ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fluxo de Caixa por Período
              </CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="grid gap-1">
                  <Label htmlFor="data-inicio">Data Início</Label>
                  <Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="data-fim">Data Fim</Label>
                  <Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label className="opacity-0">.</Label>
                  <Button onClick={recarregarFluxo} className="gap-2" disabled={isPending}>
                    <RefreshCcw className="h-4 w-4" />
                    Recalcular
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Entradas</TableHead>
                        <TableHead>Saídas</TableHead>
                        <TableHead>Saldo Líquido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(fluxo?.fluxoPorPeriodo ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            Sem dados para o período selecionado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        fluxo!.fluxoPorPeriodo.map((p, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{formatDate(p.periodo)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(p.entradas)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(p.saidas)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(p.saldoLiquido)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receber" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Contas a Receber</h3>
              <p className="text-sm text-muted-foreground">Gerencie recebimentos e acompanhe saldos</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={buscaReceber}
                  onChange={(e) => setBuscaReceber(e.target.value)}
                  placeholder="Buscar por cliente, descrição, documento..."
                  className="pl-8 w-[260px]"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                  <div className="grid gap-2">
                    <Button
                      variant={statusFilterReceber === "" ? "default" : "outline"}
                      onClick={() => setStatusFilterReceber("")}
                    >
                      Todos
                    </Button>
                    {["PENDENTE", "PARCIAL", "RECEBIDO", "VENCIDO", "CANCELADO"].map((s) => (
                      <Button
                        key={s}
                        className="justify-start"
                        variant={statusFilterReceber === s ? "default" : "outline"}
                        onClick={() => setStatusFilterReceber(s as ContaReceber["status"])}
                      >
                        <span className={cn("h-2 w-2 rounded-full mr-2", statusColors[s])} />
                        {s}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {(buscaReceber || statusFilterReceber) && (
                <Button variant="ghost" onClick={() => { setBuscaReceber(""); setStatusFilterReceber(""); }} className="gap-1">
                  <X className="h-4 w-4" /> Limpar
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Valor Recebido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasReceberFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma conta encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contasReceberFiltradas.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.cliente}</TableCell>
                        <TableCell className="max-w-[320px] truncate" title={c.descricao}>
                          {c.descricao}
                        </TableCell>
                        <TableCell>{formatDate(c.dataVencimento)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(c.valorOriginal)}</TableCell>
                        <TableCell>{formatCurrency(c.valorRecebido)}</TableCell>
                        <TableCell>
                          <Badge className={cn(statusColors[c.status] || "bg-secondary text-secondary-foreground")}>
                            {c.status}
                          </Badge>
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
                              {(c.status === "PENDENTE" || c.status === "PARCIAL" || c.status === "VENCIDO") && (
                                <DropdownMenuItem onClick={() => openReceber(c)}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Registrar Recebimento
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled>
                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                Detalhes (em breve)
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

        <TabsContent value="pagar" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Contas a Pagar</h3>
              <p className="text-sm text-muted-foreground">Registre pagamentos e monitore vencimentos</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={buscaPagar}
                  onChange={(e) => setBuscaPagar(e.target.value)}
                  placeholder="Buscar por fornecedor, descrição, documento..."
                  className="pl-8 w-[260px]"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                  <div className="grid gap-2">
                    <Button
                      variant={statusFilterPagar === "" ? "default" : "outline"}
                      onClick={() => setStatusFilterPagar("")}
                    >
                      Todos
                    </Button>
                    {["PENDENTE", "PARCIAL", "PAGO", "VENCIDO", "CANCELADO"].map((s) => (
                      <Button
                        key={s}
                        className="justify-start"
                        variant={statusFilterPagar === s ? "default" : "outline"}
                        onClick={() => setStatusFilterPagar(s as ContaPagar["status"])}
                      >
                        <span className={cn("h-2 w-2 rounded-full mr-2", statusColors[s])} />
                        {s}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {(buscaPagar || statusFilterPagar) && (
                <Button variant="ghost" onClick={() => { setBuscaPagar(""); setStatusFilterPagar(""); }} className="gap-1">
                  <X className="h-4 w-4" /> Limpar
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasPagarFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma conta encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contasPagarFiltradas.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.fornecedorNome}</TableCell>
                        <TableCell className="max-w-[320px] truncate" title={c.descricao}>
                          {c.descricao}
                        </TableCell>
                        <TableCell>{formatDate(c.dataVencimento)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(c.valorOriginal)}</TableCell>
                        <TableCell>{formatCurrency(c.valorPago)}</TableCell>
                        <TableCell>
                          <Badge className={cn(statusColors[c.status] || "bg-secondary text-secondary-foreground")}>
                            {c.status}
                          </Badge>
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
                              {(c.status === "PENDENTE" || c.status === "PARCIAL" || c.status === "VENCIDO") && (
                                <DropdownMenuItem onClick={() => openPagar(c)}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Registrar Pagamento
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled>
                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                Detalhes (em breve)
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

        <TabsContent value="vencidas" className="space-y-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Contas a Receber Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vencidasReceber.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Nenhuma conta vencida.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vencidasReceber.map((c) => {
                          const saldo = Math.max(0, c.valorOriginal - c.valorRecebido)
                          return (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium">{c.cliente}</TableCell>
                              <TableCell className="max-w-[320px] truncate" title={c.descricao}>
                                {c.descricao}
                              </TableCell>
                              <TableCell>{formatDate(c.dataVencimento)}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(saldo)}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" onClick={() => openReceber(c)}>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Receber
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Contas a Pagar Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vencidasPagar.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Nenhuma conta vencida.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vencidasPagar.map((c) => {
                          const saldo = Math.max(0, c.valorOriginal - c.valorPago)
                          return (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium">{c.fornecedorNome}</TableCell>
                              <TableCell className="max-w-[320px] truncate" title={c.descricao}>
                                {c.descricao}
                              </TableCell>
                              <TableCell>{formatDate(c.dataVencimento)}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(saldo)}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" onClick={() => openPagar(c)}>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pagar
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogo Registrar Recebimento */}
      <Dialog open={dialogReceberOpen} onOpenChange={setDialogReceberOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Registrar Recebimento</DialogTitle>
            <DialogDescription>Informe os dados do recebimento.</DialogDescription>
          </DialogHeader>
          {contaReceberSel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Cliente</div>
                  <div className="font-medium">{contaReceberSel.cliente}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Documento</div>
                  <div className="font-medium">{contaReceberSel.numeroDocumento || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Vencimento</div>
                  <div className="font-medium">{formatDate(contaReceberSel.dataVencimento)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Saldo</div>
                  <div className="font-bold">
                    {formatCurrency(Math.max(0, contaReceberSel.valorOriginal - contaReceberSel.valorRecebido))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="valor-receb">Valor</Label>
                <Input id="valor-receb" type="number" min={0} step="0.01" value={Number.isNaN(valorReceb) ? "" : valorReceb} onChange={(e) => setValorReceb(parseFloat(e.target.value) || 0)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="forma-receb">Forma de Pagamento</Label>
                <select id="forma-receb" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={formaReceb} onChange={(e) => setFormaReceb(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="conta-banc-receb">Conta Bancária (opcional)</Label>
                <Input id="conta-banc-receb" placeholder="conta-bancaria-uuid" value={contaBancReceb} onChange={(e) => setContaBancReceb(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="obs-receb">Observações</Label>
                <Input id="obs-receb" placeholder="Ex.: Pagamento integral" value={obsReceb} onChange={(e) => setObsReceb(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogReceberOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={doRegistrarRecebimento} disabled={isPending || !contaReceberSel || valorReceb <= 0}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo Registrar Pagamento */}
      <Dialog open={dialogPagarOpen} onOpenChange={setDialogPagarOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>Informe os dados do pagamento.</DialogDescription>
          </DialogHeader>
          {contaPagarSel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Fornecedor</div>
                  <div className="font-medium">{contaPagarSel.fornecedorNome}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Documento</div>
                  <div className="font-medium">{contaPagarSel.numeroDocumento || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Vencimento</div>
                  <div className="font-medium">{formatDate(contaPagarSel.dataVencimento)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Saldo</div>
                  <div className="font-bold">
                    {formatCurrency(Math.max(0, contaPagarSel.valorOriginal - contaPagarSel.valorPago))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="valor-pag">Valor</Label>
                <Input id="valor-pag" type="number" min={0} step="0.01" value={Number.isNaN(valorPag) ? "" : valorPag} onChange={(e) => setValorPag(parseFloat(e.target.value) || 0)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="forma-pag">Forma de Pagamento</Label>
                <select id="forma-pag" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={formaPag} onChange={(e) => setFormaPag(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="conta-banc-pag">Conta Bancária (opcional)</Label>
                <Input id="conta-banc-pag" placeholder="conta-bancaria-uuid" value={contaBancPag} onChange={(e) => setContaBancPag(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="obs-pag">Observações</Label>
                <Input id="obs-pag" placeholder="Ex.: Pagamento parcial" value={obsPag} onChange={(e) => setObsPag(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPagarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={doRegistrarPagamento} disabled={isPending || !contaPagarSel || valorPag <= 0}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
