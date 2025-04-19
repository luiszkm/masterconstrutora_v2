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

// Dados de exemplo
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
  // Outros funcionários...
]

// Componente para editar a avaliação com estrelas
function RatingEditor({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center">
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

  // Encontrar o funcionário pelo ID
  const funcionarioOriginal = funcionarios.find((f) => f.id === id)

  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
    dataContratacao: "",
    salario: 0,
    diaria: 0,
    diasTrabalhados: 0,
    valorAdicional: 0,
    descontos: 0,
    adiantamento: 0,
    chavePix: "",
    avaliacao: 0,
    observacao: "",
    status: "Ativo",
  })

  // Carregar dados do funcionário quando o componente montar
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

  // Função para atualizar o estado do formulário
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
          ? Number.parseFloat(value) || 0
          : value,
    }))
  }

  // Função para atualizar o departamento
  const handleDepartamentoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      departamento: value,
    }))
  }

  // Função para atualizar o status
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }))
  }

  // Função para atualizar a avaliação
  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      avaliacao: rating,
    }))
  }

  // Função para salvar as alterações
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aqui você implementaria a lógica para salvar as alterações no backend
    // Por enquanto, apenas mostraremos um toast de sucesso

    toast({
      title: "Funcionário atualizado",
      description: `As informações de ${formData.nome} foram atualizadas com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Redirecionar para a lista de funcionários
    router.push("/dashboard/funcionarios")
  }

  // Se o funcionário não for encontrado
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
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Editar Funcionário</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <Input id="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange} />
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
                <Input id="salario" type="number" placeholder="0.00" value={formData.salario} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="diaria">Diária (R$)</Label>
                <Input id="diaria" type="number" placeholder="0.00" value={formData.diaria} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasTrabalhados">Dias Trabalhados</Label>
                <Input id="diasTrabalhados" type="number" value={formData.diasTrabalhados} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorAdicional">Valor Adicional (R$)</Label>
                <Input
                  id="valorAdicional"
                  type="number"
                  placeholder="0.00"
                  value={formData.valorAdicional}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="descontos">Descontos (R$)</Label>
                <Input
                  id="descontos"
                  type="number"
                  placeholder="0.00"
                  value={formData.descontos}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adiantamento">Adiantamento (R$)</Label>
                <Input
                  id="adiantamento"
                  type="number"
                  placeholder="0.00"
                  value={formData.adiantamento}
                  onChange={handleChange}
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
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/funcionarios">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
