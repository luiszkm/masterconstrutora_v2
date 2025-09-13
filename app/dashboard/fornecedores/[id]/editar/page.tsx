'use client'

import type React from 'react'
import { useState, useEffect, useTransition, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  X,
  Loader2,
  MapPin,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react'
import {
  getFornecedorById,
  updateFornecedor,
  getCategorias
} from '@/app/actions/fornecedor'
import type { Fornecedor } from '@/types/fornecedor'

// Tipo para categoria da API
type Categoria = {
  ID: string
  Nome: string
  createdAt: string
  updatedAt: string
}

export default function EditarFornecedorPage({
  params
}: {
  readonly params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])

  // Unwrap params usando React.use()
  const { id } = use(params)

  // Estados do formulário baseados na estrutura real da API
  const [formData, setFormData] = useState({
    Nome: '',
    Contato: '',
    Email: '',
    CNPJ: '',
    Website: '',
    Endereco: '',
    NomeAtendente: '',
    Avaliacao: null as number | null,
    Observacoes: ''
  })

  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<
    string[]
  >([])

  // Carregar categorias disponíveis
  useEffect(() => {
    async function loadCategorias() {
      try {
        const categoriasData = await getCategorias()
        if (!('error' in categoriasData)) {
          setCategorias(categoriasData)
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    loadCategorias()
  }, [])

  // Carregar dados do fornecedor
  useEffect(() => {
    async function loadFornecedor() {
      try {
        const data = await getFornecedorById(id)
        if (data) {
          setFornecedor(data)
          // Mapear corretamente baseado na estrutura real da API
          setFormData({
            Nome: data.nome || data.Nome || '',
            Contato: data.contato || data.Contato || '',
            Email: data.email || data.Email || '',
            CNPJ: data.cnpj || data.CNPJ || '',
            Website: data.website || data.Website || '',
            Endereco: data.endereco || data.Endereco || '',
            NomeAtendente: data.nomeAtendente || data.NomeAtendente || '',
            Avaliacao: data.avaliacao || data.Avaliacao || null,
            Observacoes: data.observacoes || data.Observacoes || ''
          })
          // Mapear categorias corretamente
          let categoriasIds: string[] = []
          if (data.categorias) {
            categoriasIds = data.categorias.map(cat => cat.ID)
          } else if (data.Categorias) {
            categoriasIds = data.Categorias.map(cat => cat.ID)
          }
          setCategoriasSelecionadas(categoriasIds)
        } else {
          toast({
            title: 'Fornecedor não encontrado',
            description: 'O fornecedor solicitado não existe',
            variant: 'destructive'
          })
          router.push('/dashboard/fornecedores')
        }
      } catch (error) {
        toast({
          title: 'Erro ao carregar fornecedor',
          description: 'Tente novamente em alguns instantes',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadFornecedor()
  }, [id, router])

  // Função para atualizar dados do formulário
  const updateFormData = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para adicionar categoria
  const adicionarCategoria = (categoriaId: string) => {
    if (categoriaId && !categoriasSelecionadas.includes(categoriaId)) {
      setCategoriasSelecionadas(prev => [...prev, categoriaId])
    }
  }

  // Função para remover categoria
  const removerCategoria = (categoriaId: string) => {
    setCategoriasSelecionadas(prev =>
      prev.filter(catId => catId !== categoriaId)
    )
  }

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações básicas
    if (!formData.Nome.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'Nome da empresa é obrigatório',
        variant: 'destructive'
      })
      return
    }

    if (!formData.Email.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'Email é obrigatório',
        variant: 'destructive'
      })
      return
    }

    if (!formData.Contato.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'Pessoa de contato é obrigatória',
        variant: 'destructive'
      })
      return
    }

    if (!formData.CNPJ.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'CNPJ é obrigatório',
        variant: 'destructive'
      })
      return
    }

    if (categoriasSelecionadas.length === 0) {
      toast({
        title: 'Erro de validação',
        description: 'Selecione pelo menos uma categoria',
        variant: 'destructive'
      })
      return
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.Email)) {
      toast({
        title: 'Erro de validação',
        description: 'Email deve ter um formato válido',
        variant: 'destructive'
      })
      return
    }

    startTransition(async () => {
      const updateData = {
        ...formData,
        categoriaIds: categoriasSelecionadas,
        // Converter campos vazios para null
        Website: formData.Website.trim() || null,
        Endereco: formData.Endereco.trim() || null,
        NomeAtendente: formData.NomeAtendente.trim() || null,
        Observacoes: formData.Observacoes.trim() || null
      }

      const result = await updateFornecedor(id, updateData)

      if (result.success) {
        toast({
          title: 'Fornecedor atualizado',
          description: result.message
        })
        router.push('/dashboard/fornecedores')
      } else {
        toast({
          title: 'Erro ao atualizar fornecedor',
          description: result.message,
          variant: 'destructive'
        })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/fornecedores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Carregando Fornecedor
            </h2>
            <p className="text-muted-foreground">
              Aguarde enquanto carregamos os dados...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados do fornecedor...</span>
        </div>
      </div>
    )
  }

  if (!fornecedor) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/fornecedores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Fornecedor não encontrado
            </h2>
            <p className="text-muted-foreground">
              O fornecedor solicitado não existe ou foi removido
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <div className="ml-4">
            <p className="text-lg font-medium">Fornecedor não encontrado</p>
            <p className="text-muted-foreground">
              Verifique se o ID está correto ou se o fornecedor ainda existe
            </p>
          </div>
        </div>
      </div>
    )
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Editar Fornecedor
          </h2>
          <p className="text-muted-foreground">
            Atualize as informações do fornecedor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Atuais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Atuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Status Atual
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          (fornecedor.status || fornecedor.Status) === 'Ativo'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {fornecedor.status || fornecedor.Status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Orçamentos
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        {fornecedor.orcamentosCount || 0}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/fornecedores/${
                            fornecedor.id || fornecedor.ID
                          }/orcamentos`}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">
                      Nome da Empresa <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome"
                      value={formData.Nome}
                      onChange={e => updateFormData('Nome', e.target.value)}
                      placeholder="Ex: Casa do Construtor Center"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">
                      CNPJ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      value={formData.CNPJ}
                      onChange={e => updateFormData('CNPJ', e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contato">
                      Pessoa de Contato <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contato"
                      value={formData.Contato}
                      onChange={e => updateFormData('Contato', e.target.value)}
                      placeholder="Ex: Carlos Andrade"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.Observacoes}
                    onChange={e =>
                      updateFormData('Observacoes', e.target.value)
                    }
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
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.Email}
                      onChange={e => updateFormData('Email', e.target.value)}
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
                        onChange={e =>
                          updateFormData('Endereco', e.target.value)
                        }
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
            {/* Status e Avaliação */}
            <Card>
              <CardHeader>
                <CardTitle>Status e Avaliação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        (fornecedor.status || fornecedor.Status) === 'Ativo'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {fornecedor.status || fornecedor.Status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      (Use as ações da lista para alterar)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avaliacao">Avaliação</Label>
                  <Select
                    value={formData.Avaliacao?.toString() || '0'}
                    onValueChange={value =>
                      updateFormData(
                        'Avaliacao',
                        value ? Number.parseFloat(value) : null
                      )
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
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Orçamentos: {fornecedor.orcamentosCount}</p>
                  <p>ID: {fornecedor.id || fornecedor.ID}</p>
                </div>
              </CardContent>
            </Card>

            {/* Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Adicionar Categoria</Label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={value => {
                        adicionarCategoria(value)
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias
                          .filter(
                            categoria =>
                              !categoriasSelecionadas.includes(categoria.ID)
                          )
                          .map(categoria => (
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
                      {categoriasSelecionadas.map(categoriaId => {
                        const categoria = categorias.find(
                          cat => cat.ID === categoriaId
                        )
                        return (
                          <Badge
                            key={categoriaId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {categoria?.Nome || 'Categoria não encontrada'}
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
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria selecionada
                  </p>
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
              'Atualizar Fornecedor'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
