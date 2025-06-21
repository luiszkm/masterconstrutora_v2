"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building, Calendar, MapPin, User, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { criarObra } from "@/app/actions/obra"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

const responsaveisMock = ["Maria Oliveira", "Carlos Santos", "Ana Pereira", "Pedro Souza", "João Silva"]

export default function NovaObraPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    nome: "",
    cliente: "",
    endereco: "",
    dataInicio: "",
    dataFim: "",
    responsavel: "",
    descricao: "",
  })

  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState<number[]>([])

  const funcionariosDisponiveis = [
    { id: 1, nome: "João Silva", cargo: "Pedreiro" },
    { id: 2, nome: "Maria Oliveira", cargo: "Engenheira Civil" },
    { id: 3, nome: "Carlos Santos", cargo: "Eletricista" },
    { id: 4, nome: "Ana Pereira", cargo: "Arquiteta" },
    { id: 5, nome: "Pedro Souza", cargo: "Mestre de Obras" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações básicas
    if (
      !formData.nome ||
      !formData.cliente ||
      !formData.endereco ||
      !formData.dataInicio ||
      !formData.dataFim ||
      !formData.responsavel
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Validar datas
    if (new Date(formData.dataInicio) >= new Date(formData.dataFim)) {
      toast({
        title: "Erro",
        description: "A data de fim deve ser posterior à data de início.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })

      // Adicionar funcionários ao FormData
      funcionariosSelecionados.forEach((funcionarioId) => {
        form.append("funcionarios", funcionarioId.toString())
      })

      const result = await criarObra(form)

      if (result.success) {
        toast({
          title: "Obra criada",
          description: `A obra ${formData.nome} foi criada com sucesso.`,
        })
        router.push("/dashboard/obras")
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/obras">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Nova Obra</h2>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações da Obra
            </CardTitle>
            <CardDescription>
              Preencha os dados básicos da nova obra. As etapas serão criadas automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="informacoes" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="informacoes">Informações</TabsTrigger>
                  <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
                </TabsList>

                <TabsContent value="informacoes">
                  {/* Conteúdo do formulário atual aqui */}
                  {/* Nome e Cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Nome da Obra *
                      </Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Mansão Alphaville"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cliente" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cliente *
                      </Label>
                      <Input
                        id="cliente"
                        placeholder="Nome do cliente"
                        value={formData.cliente}
                        onChange={(e) => handleInputChange("cliente", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Endereço *
                    </Label>
                    <Input
                      id="endereco"
                      placeholder="Endereço completo da obra"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      required
                    />
                  </div>

                  {/* Datas e Responsável */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Início *
                      </Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFim" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Conclusão *
                      </Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={formData.dataFim}
                        onChange={(e) => handleInputChange("dataFim", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsavel" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Responsável *
                      </Label>
                      <Select
                        value={formData.responsavel}
                        onValueChange={(value) => handleInputChange("responsavel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {responsaveisMock.map((responsavel) => (
                            <SelectItem key={responsavel} value={responsavel}>
                              {responsavel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Descrição
                    </Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descrição detalhada da obra (opcional)"
                      value={formData.descricao}
                      onChange={(e) => handleInputChange("descricao", e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Informações sobre etapas */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Etapas da Obra</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      As seguintes etapas serão criadas automaticamente, cada uma representando 20% da obra:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                      {["Fundações", "Estrutura", "Alvenaria", "Instalações", "Acabamentos"].map((etapa, index) => (
                        <div key={etapa} className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          {etapa}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="funcionarios">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Selecionar Funcionários</h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha os funcionários que serão alocados nesta obra.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {funcionariosDisponiveis.map((funcionario) => (
                        <div key={funcionario.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Checkbox
                            id={`funcionario-${funcionario.id}`}
                            checked={funcionariosSelecionados.includes(funcionario.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFuncionariosSelecionados([...funcionariosSelecionados, funcionario.id])
                              } else {
                                setFuncionariosSelecionados(
                                  funcionariosSelecionados.filter((id) => id !== funcionario.id),
                                )
                              }
                            }}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`funcionario-${funcionario.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {funcionario.nome}
                            </label>
                            <p className="text-xs text-muted-foreground">{funcionario.cargo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                <Button variant="outline" asChild disabled={isPending}>
                  <Link href="/dashboard/obras">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Criando..." : "Criar Obra"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
