"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Importar Card components
import { NumericFormat } from "react-number-format" // Importar NumericFormat

// Dados de exemplo (mantidos para demonstração)
const funcionarios = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Engenheiro Civil",
    departamento: "Projetos",
    dataContratacao: "2020-03-15",
    status: "Ativo",
    diaria: 350.0,
    diasTrabalhados: 22,
    valorAdicional: 500.0,
    descontos: 150.0,
    adiantamento: 1000.0,
    chavePix: "joao.silva@exemplo.com",
    avaliacao: 4.5,
    observacao:
      "Excelente profissional, sempre pontual e comprometido com os prazos. Demonstra grande conhecimento técnico e liderança.",
    cpf: "123.456.789-00",
    email: "joao.silva@exemplo.com",
    telefone: "(11) 98765-4321",
    salario: 7700.0,
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    cargo: "Arquiteta",
    departamento: "Design",
    dataContratacao: "2019-07-22",
    status: "Ativo",
    diaria: 320.0,
    diasTrabalhados: 20,
    valorAdicional: 0.0,
    descontos: 0.0,
    adiantamento: 0.0,
    chavePix: "12345678900",
    avaliacao: 5,
    observacao:
      "Profissional excepcional, com grande criatividade e atenção aos detalhes. Seus projetos sempre superam as expectativas dos clientes.",
    cpf: "987.654.321-00",
    email: "maria.oliveira@exemplo.com",
    telefone: "(11) 91234-5678",
    salario: 6400.0,
  },
]

// Componente para editar a avaliação com estrelas
function RatingEditor({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {" "}
      {/* Adicionado gap para espaçamento */}
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
          <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
      <span className="ml-2">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function EditarFuncionarioPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = Number.parseInt(params.id)

  const funcionarioOriginal = funcionarios.find((f) => f.id === id)

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
    dataContratacao: "",
    salario: null as number | null, // Alterado para null
    diaria: null as number | null, // Alterado para null
    diasTrabalhados: null as number | null, // Alterado para null
    valorAdicional: null as number | null, // Alterado para null
    descontos: null as number | null, // Alterado para null
    adiantamento: null as number | null, // Alterado para null
    chavePix: "",
    avaliacao: 0,
    observacao: "",
    status: "Ativo",
  })

  useEffect(() => {
    if (funcionarioOriginal) {
      setFormData({
        nome: funcionarioOriginal.nome,
        cpf: funcionarioOriginal.cpf,
        email: funcionarioOriginal.email,
        telefone: funcionarioOriginal.telefone,
        cargo: funcionarioOriginal.cargo,
        departamento: funcionarioOriginal.departamento,
        dataContratacao: funcionarioOriginal.dataContratacao,
        salario: funcionarioOriginal.salario,
        diaria: funcionarioOriginal.diaria,
        diasTrabalhados: funcionarioOriginal.diasTrabalhados,
        valorAdicional: funcionarioOriginal.valorAdicional,
        descontos: funcionarioOriginal.descontos,
        adiantamento: funcionarioOriginal.adiantamento,
        chavePix: funcionarioOriginal.chavePix,
        avaliacao: funcionarioOriginal.avaliacao,
        observacao: funcionarioOriginal.observacao,
        status: funcionarioOriginal.status,
      })
    }
  }, [funcionarioOriginal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "diaria" ||
        id === "diasTrabalhados" ||
        id === "valorAdicional" ||
        id === "descontos" ||
        id === "adiantamento" ||
        id === "salario"
          ? value === ""
            ? null
            : Number.parseFloat(value) || 0 // Trata string vazia como null
          : value,
    }))
  }

  const handleNumericChange = (id: string, floatValue: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [id]: floatValue === undefined ? null : floatValue, // Trata undefined (campo vazio) como null
    }))
  }

  const handleDepartamentoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      departamento: value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      avaliacao: rating,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Funcionário atualizado",
      description: `As informações de ${formData.nome} foram atualizadas com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    router.push("/dashboard/funcionarios")
  }

  if (!funcionarioOriginal) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/funcionarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Funcionário não encontrado</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Editar Funcionário</h2>
      </div>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Funcionário</CardTitle>
          <CardDescription>Edite as informações do funcionário.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" placeholder="Nome do funcionário" value={formData.nome} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" placeholder="Cargo do funcionário" value={formData.cargo} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select value={formData.departamento} onValueChange={handleDepartamentoChange}>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Projetos">Projetos</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Construção">Construção</SelectItem>
                      <SelectItem value="Administração">Administração</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataContratacao">Data de Contratação</Label>
                  <Input id="dataContratacao" type="date" value={formData.dataContratacao} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salário</Label>
                  <NumericFormat
                    id="salario"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={formData.salario === null ? "" : formData.salario}
                    onValueChange={(values) => handleNumericChange("salario", values.floatValue)}
                    customInput={Input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="diaria">Diária (R$)</Label>
                  <NumericFormat
                    id="diaria"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={formData.diaria === null ? "" : formData.diaria}
                    onValueChange={(values) => handleNumericChange("diaria", values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diasTrabalhados">Dias Trabalhados</Label>
                  <Input
                    id="diasTrabalhados"
                    type="number"
                    value={formData.diasTrabalhados === null ? "" : formData.diasTrabalhados}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorAdicional">Valor Adicional (R$)</Label>
                  <NumericFormat
                    id="valorAdicional"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={formData.valorAdicional === null ? "" : formData.valorAdicional}
                    onValueChange={(values) => handleNumericChange("valorAdicional", values.floatValue)}
                    customInput={Input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="descontos">Descontos (R$)</Label>
                  <NumericFormat
                    id="descontos"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={formData.descontos === null ? "" : formData.descontos}
                    onValueChange={(values) => handleNumericChange("descontos", values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adiantamento">Adiantamento (R$)</Label>
                  <NumericFormat
                    id="adiantamento"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    fixedDecimalScale
                    decimalScale={2}
                    placeholder="0,00"
                    value={formData.adiantamento === null ? "" : formData.adiantamento}
                    onValueChange={(values) => handleNumericChange("adiantamento", values.floatValue)}
                    customInput={Input}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chavePix">Chave PIX</Label>
                  <Input
                    id="chavePix"
                    placeholder="CPF, email, telefone ou chave aleatória"
                    value={formData.chavePix}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Férias">Férias</SelectItem>
                      <SelectItem value="Licença">Licença</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Avaliação</Label>
                  <RatingEditor rating={formData.avaliacao} onChange={handleRatingChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacao">Observações</Label>
                <Textarea
                  id="observacao"
                  placeholder="Informações adicionais sobre o funcionário"
                  value={formData.observacao}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/funcionarios">Cancelar</Link>
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
