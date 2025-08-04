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
import { ArrowLeft, X, Loader2, Globe, MapPin, User } from "lucide-react"
import { createFornecedor, getCategorias } from "@/app/actions/fornecedor"
import type { CreateFornecedor } from "@/types/fornecedor"

// Tipo para categoria da API
type Categoria = {
  ID: string
  Nome: string
  createdAt: string
  updatedAt: string
}

export default function NovoFornecedorPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  // Estados do formulário baseados na estrutura real da API
  const [formData, setFormData] = useState({
    Nome: "",
    Contato: "",
    Email: "",
    CNPJ: "",
    Website: "",
    Endereco: "",
    NomeAtendente: "",
    Avaliacao: null as number | null,
    Observacoes: "",
  })

  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([])

  // Carregar categorias disponíveis
  useEffect(() => {
    async function loadCategorias() {
      try {
        const categoriasData = await getCategorias()
        if (!("error" in categoriasData)) {
          setCategorias(categoriasData)
        } else {
          toast({
            title: "Erro ao carregar categorias",
            description: categoriasData.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar categorias",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        })
      } finally {
        setLoadingCategorias(false)
      }
    }
    loadCategorias()
  }, [])

  // Função para atualizar dados do formulário
  const updateFormData = (field: string, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Função para adicionar categoria
  const adicionarCategoria = (categoriaId: string) => {
    if (categoriaId && !categoriasSelecionadas.includes(categoriaId)) {
      setCategoriasSelecionadas((prev) => [...prev, categoriaId])
    }
  }

  // Função para remover categoria
  const removerCategoria = (categoriaId: string) => {
    setCategoriasSelecionadas((prev) => prev.filter((id) => id !== categoriaId))
  }

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (categoriasSelecionadas.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma categoria",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const createData: CreateFornecedor = {
        ...formData,
        categoriaIds: categoriasSelecionadas,
        // Converter campos vazios para undefined
        Website: formData.Website || undefined,
        Endereco: formData.Endereco || undefined,
        NomeAtendente: formData.NomeAtendente || undefined,
        Observacoes: formData.Observacoes || undefined,
      }

      const result = await createFornecedor(createData)

      if (result.success) {
        toast({
          title: "Fornecedor criado",
          description: result.message,
        })
        router.push("/dashboard/fornecedores")
      } else {
        toast({
          title: "Erro ao criar fornecedor",
          description: result.message,
          variant: "destructive",
        })
      }
    })
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Novo Fornecedor</h2>
          <p className="text-muted-foreground">Cadastre um novo fornecedor no sistema</p>
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
                      value={formData.Nome}
                      onChange={(e) => updateFormData("Nome", e.target.value)}
                      placeholder="Ex: Casa do Construtor Center"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.CNPJ}
                      onChange={(e) => updateFormData("CNPJ", e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contato">Pessoa de Contato *</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contato"
                        value={formData.Contato}
                        onChange={(e) => updateFormData("Contato", e.target.value)}
                        placeholder="Ex: Carlos Andrade"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.Observacoes}
                    onChange={(e) => updateFormData("Observacoes", e.target.value)}
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
                      value={formData.Email}
                      onChange={(e) => updateFormData("Email", e.target.value)}
                      placeholder="comercial@empresa.com.br"
                      required
                    />
                  </div>
                  
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endereco"
                      value={formData.Endereco}
                      onChange={(e) => updateFormData("Endereco", e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                      className="pl-8"
                    />
                  </div>
                </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avaliação */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliação Inicial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avaliacao">Avaliação</Label>
                  <Select
                    value={formData.Avaliacao?.toString() || "0"}
                    onValueChange={(value) =>
                      updateFormData("Avaliacao", value === "0" ? null : Number.parseFloat(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem avaliação</SelectItem>
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
                  <p className="text-xs text-muted-foreground">A avaliação pode ser alterada posteriormente</p>
                </div>
              </CardContent>
            </Card>

            {/* Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingCategorias ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Carregando categorias...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Adicionar Categoria</Label>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => {
                            adicionarCategoria(value)
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias
                              .filter((categoria) => !categoriasSelecionadas.includes(categoria.ID))
                              .map((categoria) => (
                                <SelectItem key={categoria.ID} value={categoria.ID}>
                                  {categoria.Nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {categoriasSelecionadas.length > 0 && (
                      <div className="space-y-2">
                        <Label>Categorias Selecionadas</Label>
                        <div className="flex flex-wrap gap-2">
                          {categoriasSelecionadas.map((categoriaId) => {
                            const categoria = categorias.find((cat) => cat.ID === categoriaId)
                            return (
                              <Badge key={categoriaId} variant="secondary" className="flex items-center gap-1">
                                {categoria?.Nome || "Categoria não encontrada"}
                                <button
                                  type="button"
                                  onClick={() => removerCategoria(categoriaId)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {categoriasSelecionadas.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhuma categoria selecionada</p>
                    )}

                    {categorias.length === 0 && !loadingCategorias && (
                      <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
                    )}
                  </>
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
          <Button type="submit" disabled={isPending || loadingCategorias}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Fornecedor"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
