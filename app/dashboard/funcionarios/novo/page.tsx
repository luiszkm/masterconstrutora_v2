"use client"

import { useActionState, useState, useEffect } from "react"
import { createFuncionario, createFuncionarioPayment, getObrasList, type ObraListItem } from "@/app/actions/funcionario"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { NumericFormat } from "react-number-format"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Importar useToast
import router from "next/router"
import { useRouter } from "next/navigation"

export default function NovoFuncionarioPage() {
  const { toast } = useToast() // Inicializar useToast
const{push} = useRouter()
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const [basicFormState, basicFormAction, isBasicFormPending] = useActionState(createFuncionario, null)
  const [paymentFormState, paymentFormAction, isPaymentFormPending] = useActionState(createFuncionarioPayment, null)

  const [obrasDisponiveis, setObrasDisponiveis] = useState<ObraListItem[]>([])
  const [selectedObraId, setSelectedObraId] = useState<string>("none") // Estado para a obra selecionada

  useEffect(() => {
    if (basicFormState?.success && basicFormState.funcionarioId) {
      setEmployeeId(basicFormState.funcionarioId)
      setShowPaymentForm(true)
      toast({
        title: "Sucesso!",
        description: basicFormState.message,
        variant: "default",
      })
    } else if (basicFormState?.success === false) {
      toast({
        title: "Erro",
        description: basicFormState.message,
        variant: "destructive",
      })
    }
  }, [basicFormState, toast])

  useEffect(() => {
    if (paymentFormState?.success) {
      toast({
        title: "Sucesso!",
        description: paymentFormState.message,
        variant: "default",
      })
      push('/dashboard/funcionarios');
    } else if (paymentFormState?.success === false) {
      toast({
        title: "Erro",
        description: paymentFormState.message,
        variant: "destructive",
      })
    }
  }, [paymentFormState, toast])

  // Carregar obras quando o formulário de pagamento for exibido
  useEffect(() => {
    if (showPaymentForm) {
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
  }, [showPaymentForm, toast])

  const [departamento, setDepartamento] = useState("")

  const [diaria, setDiaria] = useState<number | null>(null)
  const [diasTrabalhados, setDiasTrabalhados] = useState<number | null>(null)
  const [valorAdicional, setValorAdicional] = useState<number | null>(null)
  const [descontos, setDescontos] = useState<number | null>(null)
  const [adiantamento, setAdiantamento] = useState<number | null>(null)
  const [valorTotal, setValorTotal] = useState<number | null>(null)

  const getDefaultPeriodDates = () => {
    const today = new Date()
    const startDate = today.toISOString().split("T")[0]

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 14)
    const endDateString = endDate.toISOString().split("T")[0]

    return { startDate, endDate: endDateString }
  }

  const { startDate, endDate } = getDefaultPeriodDates()
  const [periodoInicio, setPeriodoInicio] = useState(startDate)
  const [periodoFim, setPeriodoFim] = useState(endDate)

  useEffect(() => {
    const d = diaria || 0
    const dt = diasTrabalhados || 0
    const va = valorAdicional || 0
    const ds = descontos || 0
    const ad = adiantamento || 0

    const calculatedTotal = d * dt + va - ds - ad

    if (calculatedTotal === 0 && d === 0 && dt === 0 && va === 0 && ds === 0 && ad === 0) {
      setValorTotal(null)
    } else {
      setValorTotal(calculatedTotal)
    }
  }, [diaria, diasTrabalhados, valorAdicional, descontos, adiantamento])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Novo Funcionário</h2>
      </div>

      {!showPaymentForm ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Dados Básicos do Funcionário</CardTitle>
            <CardDescription>Preencha as informações pessoais e de cargo do novo funcionário.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <form action={basicFormAction} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" placeholder="Nome do funcionário" required />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" placeholder="Cargo do funcionário" />
                </div>
                <div>
                  <Label htmlFor="dataContratacao">Data de Contratação</Label>
                  <Input id="dataContratacao" name="dataContratacao" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Select onValueChange={setDepartamento} value={departamento}>
                  <SelectTrigger id="departamento">
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="projetos">Projetos</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="construcao">Construção</SelectItem>
                    <SelectItem value="administracao">Administração</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="departamento" value={departamento} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chavePix">Chave Pix</Label>
                  <Input id="chavePix" name="chavePix" placeholder="CPF, email, telefone ou chave aleatória" />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  placeholder="Informações adicionais sobre o funcionário"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/dashboard/funcionarios">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isBasicFormPending} className="w-full sm:w-auto">
                  {isBasicFormPending ? "Criando Funcionário..." : "Próximo: Informações de Pagamento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
            <CardDescription>Preencha os detalhes de pagamento para o funcionário (ID: {employeeId}).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <form action={paymentFormAction} className="space-y-8">
              <input type="hidden" name="funcionarioId" value={employeeId || ""} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodoInicio">Período de Início</Label>
                  <Input
                    id="periodoInicio"
                    name="periodoInicio"
                    type="date"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="periodoFim">Período de Fim</Label>
                  <Input
                    id="periodoFim"
                    name="periodoFim"
                    type="date"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Novo Select para Obra */}
              <div>
                <Label htmlFor="obraId">Vincular à Obra</Label>
                <Select onValueChange={setSelectedObraId} value={selectedObraId}>
                  <SelectTrigger id="obraId">
                    <SelectValue placeholder="Selecione uma obra (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma Obra</SelectItem> {/* Opção para não vincular */}
                    {obrasDisponiveis.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.nome} ({obra.cliente})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="obraId" value={selectedObraId} />
              </div>

              <h3 className="text-xl font-semibold">Cálculo de Pagamento</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="diaria">Diária</Label>
                  <NumericFormat
                    id="diaria"
                    name="diaria"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={diaria === null ? "" : diaria}
                    onValueChange={(values) => setDiaria(values.floatValue === undefined ? null : values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div>
                  <Label htmlFor="diasTrabalhados">Dias Trabalhados</Label>
                  <Input
                    id="diasTrabalhados"
                    name="diasTrabalhados"
                    type="number"
                    placeholder="0"
                    value={diasTrabalhados === null ? "" : diasTrabalhados}
                    onChange={(e) =>
                      setDiasTrabalhados(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valorAdicional">Valor Adicional</Label>
                  <NumericFormat
                    id="valorAdicional"
                    name="valorAdicional"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={valorAdicional === null ? "" : valorAdicional}
                    onValueChange={(values) =>
                      setValorAdicional(values.floatValue === undefined ? null : values.floatValue)
                    }
                    customInput={Input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="descontos">Descontos</Label>
                  <NumericFormat
                    id="descontos"
                    name="descontos"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={descontos === null ? "" : descontos}
                    onValueChange={(values) => setDescontos(values.floatValue === undefined ? null : values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div>
                  <Label htmlFor="adiantamento">Adiantamento</Label>
                  <NumericFormat
                    id="adiantamento"
                    name="adiantamento"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={adiantamento === null ? "" : adiantamento}
                    onValueChange={(values) =>
                      setAdiantamento(values.floatValue === undefined ? null : values.floatValue)
                    }
                    customInput={Input}
                  />
                </div>
                <div>
                  <Label htmlFor="valorTotal">Valor Total</Label>
                  <Input
                    id="valorTotal"
                    name="valorTotal"
                    type="text"
                    value={valorTotal === null ? "" : `R$ ${valorTotal.toFixed(2).replace(".", ",")}`}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPaymentForm(false)} className="w-full sm:w-auto">
                  Voltar
                </Button>
                <Button type="submit" disabled={isPaymentFormPending} className="w-full sm:w-auto">
                  {isPaymentFormPending ? "Salvando Pagamento..." : "Salvar Pagamento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
