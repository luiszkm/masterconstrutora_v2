"use client"

import type React from "react"

import { useState, useEffect, useTransition, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building, Calendar, MapPin, User, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { atualizarObra, type Obra, getObraById } from "@/app/actions/obra"

const responsaveisMock = ["Maria Oliveira", "Carlos Santos", "Ana Pereira", "Pedro Souza", "João Silva"]

export default function EditarObraPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const params = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [obra, setObra] = useState<Obra | null>(null)
  const obraId = params.id
  const [formData, setFormData] = useState({
    nome: "",
    cliente: "",
    endereco: "",
    dataInicio: "",
    dataFim: "",
    responsavel: "",
    descricao: "",
    status: "Em andamento" as "Em andamento" | "Concluída" | "Pausada",
  })
  // Carregar dados da obra
  useEffect(() => {
    const carregarObra = async () => {
      try {
        const result = await getObraById(obraId)
        if (result.success && result.data) {
          const obraData = result.data
          setObra(obraData)
          setFormData({
            nome: obraData.nome || "",
            cliente: obraData.cliente || "",
            endereco: obraData.endereco || "",
            dataInicio: obraData.dataInicio ? new Date(obraData.dataInicio).toISOString().split("T")[0] : "",
            dataFim: obraData.dataFim ? new Date(obraData.dataFim).toISOString().split("T")[0] : "",
            responsavel: "",
            descricao: obraData.descricao || "",
            status: (obraData.status as "Em andamento" | "Concluída" | "Pausada") || "Em andamento",
          })
        } else {
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive",
          })
          router.push("/dashboard/obras")
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados da obra",
          variant: "destructive",
        })
        router.push("/dashboard/obras")
      } finally {
        setLoading(false)
      }
    }

    carregarObra()
  }, [obraId, router])

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
      !formData.dataFim    ) {
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

      const result = await atualizarObra(params.id, form)

      if (result.success) {
        toast({
          title: "Obra atualizada",
          description: `A obra ${formData.nome} foi atualizada com sucesso.`,
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

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/obras">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Obra</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/obras">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Obra não encontrada</h2>
        </div>
      </div>
    )
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
        <h2 className="text-3xl font-bold tracking-tight">Editar Obra</h2>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações da Obra
            </CardTitle>
            <CardDescription>Atualize os dados da obra "{obra.nome}".</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Datas, Responsável e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Label htmlFor="status" className="flex items-center gap-2">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Em andamento" | "Concluída" | "Pausada") =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                                            <SelectItem value="Em Planejamento">Em Planejamento</SelectItem>

                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
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

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                <Button variant="outline" asChild disabled={isPending}>
                  <Link href="/dashboard/obras">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
