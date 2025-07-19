"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import { getFornecedorById, updateFornecedor, type Fornecedor } from "@/app/actions/fornecedor"

// Lista de categorias disponíveis
const categorias = [
  "Materiais de Construção",
  "Material Elétrico",
  "Material Hidráulico",
  "Madeiras",
  "Revestimentos",
  "Ferragens",
  "Tintas e Vernizes",
  "Vidros e Esquadrias",
  "Telhas e Coberturas",
  "Pisos e Acabamentos",
]

// Lista de materiais disponíveis
const tiposMateriais = [
  "Cimento",
  "Areia",
  "Brita",
  "Aço",
  "Tintas",
  "Mármores",
  "Granitos",
  "Porcelanatos",
  "Cabos",
  "Disjuntores",
  "Quadros Elétricos",
  "Tubos PVC",
  "Conexões",
  "Registros",
  "Caixas d'água",
  "Madeira Maciça",
  "Compensados",
  "MDF",
  "Portas",
  "Deck",
  "Telhas",
  "Vidros",
  "Ferragens",
  "Impermeabilizantes",
  "Argamassas",
  "Gesso",
  "Drywall",
  "Isolantes",
  "Pisos Laminados",
  "Pisos Vinílicos",
]

export default function EditarFornecedorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    contato: "",
    email: "",
    telefone: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",
    cnpj: "",
    status: "Ativo" as "Ativo" | "Inativo",
    avaliacao: 5,
    observacoes: "",
  })

  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([])
  const [novoMaterial, setNovoMaterial] = useState("")

  // Carregar dados do fornecedor
  useEffect(() => {
    async function loadFornecedor() {
      try {
        const data = await getFornecedorById(params.id)
        if (data) {
          setFornecedor(data)
          setFormData({
            nome: data.nome,
            categoria: data.categoria,
            contato: data.contato,
            email: data.email,
            telefone: data.telefone,
            endereco: data.endereco,
            cep: data.cep,
            cidade: data.cidade,
            estado: data.estado,
            cnpj: data.cnpj,
            status: data.status,
            avaliacao: data.avaliacao,
            observacoes: data.observacoes || "",
          })
          setMateriaisSelecionados(data.materiais.map((m) => m.nome))
        } else {
          toast({
            title: "Fornecedor não encontrado",
            description: "O fornecedor solicitado não existe",
            variant: "destructive",
          })
          router.push("/dashboard/fornecedores")
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar fornecedor",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFornecedor()
  }, [params.id, router])

  // Função para atualizar dados do formulário
  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Função para adicionar material
  const adicionarMaterial = (material: string) => {
    if (material && !materiaisSelecionados.includes(material)) {
      setMateriaisSelecionados((prev) => [...prev, material])
      setNovoMaterial("")
    }
  }

  // Função para remover material
  const removerMaterial = (material: string) => {
    setMateriaisSelecionados((prev) => prev.filter((m) => m !== material))
  }

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (materiaisSelecionados.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos um material",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const materiais = materiaisSelecionados.map((nome, index) => ({
        id: index + 1,
        nome,
      }))

      const result = await updateFornecedor(params.id, {
        ...formData,
        materiais,
      })

      if (result.success) {
        toast({
          title: "Fornecedor atualizado",
          description: result.message,
        })
        router.push("/dashboard/fornecedores")
      } else {
        toast({
          title: "Erro ao atualizar fornecedor",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!fornecedor) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/fornecedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Editar Fornecedor</h2>
          <p className="text-muted-foreground">Atualize as informações do fornecedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Empresa *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => updateFormData("nome", e.target.value)}
                      placeholder="Ex: Construtora Silva & Cia"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => updateFormData("categoria", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contato">Pessoa de Contato *</Label>
                    <Input
                      id="contato"
                      value={formData.contato}
                      onChange={(e) => updateFormData("contato", e.target.value)}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => updateFormData("cnpj", e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => updateFormData("observacoes", e.target.value)}
                    placeholder="Informações adicionais sobre o fornecedor..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="contato@empresa.com.br"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => updateFormData("telefone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => updateFormData("endereco", e.target.value)}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => updateFormData("cep", e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => updateFormData("cidade", e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => updateFormData("estado", e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status e Avaliação */}
            <Card>
              <CardHeader>
                <CardTitle>Status e Avaliação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Ativo" | "Inativo") => updateFormData("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avaliacao">Avaliação</Label>
                  <Select
                    value={formData.avaliacao.toString()}
                    onValueChange={(value) => updateFormData("avaliacao", Number.parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 estrelas</SelectItem>
                      <SelectItem value="4.5">4.5 estrelas</SelectItem>
                      <SelectItem value="4">4 estrelas</SelectItem>
                      <SelectItem value="3.5">3.5 estrelas</SelectItem>
                      <SelectItem value="3">3 estrelas</SelectItem>
                      <SelectItem value="2.5">2.5 estrelas</SelectItem>
                      <SelectItem value="2">2 estrelas</SelectItem>
                      <SelectItem value="1.5">1.5 estrelas</SelectItem>
                      <SelectItem value="1">1 estrela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Orçamentos: {fornecedor.orcamentos}</p>
                  <p>Criado em: {new Date(fornecedor.createdAt).toLocaleDateString("pt-BR")}</p>
                  <p>Atualizado em: {new Date(fornecedor.updatedAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Materiais */}
            <Card>
              <CardHeader>
                <CardTitle>Materiais Fornecidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Adicionar Material</Label>
                  <div className="flex gap-2">
                    <Select value={novoMaterial} onValueChange={setNovoMaterial}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um material" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposMateriais
                          .filter((material) => !materiaisSelecionados.includes(material))
                          .map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => adicionarMaterial(novoMaterial)}
                      disabled={!novoMaterial}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {materiaisSelecionados.length > 0 && (
                  <div className="space-y-2">
                    <Label>Materiais Selecionados</Label>
                    <div className="flex flex-wrap gap-2">
                      {materiaisSelecionados.map((material) => (
                        <Badge key={material} variant="secondary" className="flex items-center gap-1">
                          {material}
                          <button
                            type="button"
                            onClick={() => removerMaterial(material)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/fornecedores">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar Fornecedor"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
