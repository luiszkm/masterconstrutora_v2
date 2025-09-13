'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ArrowLeft, Download, Package, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  compararOrcamentosPorCategoria,
} from '@/app/actions/orcamentos-comparacao'
import {
  ComparacaoOrcamentosResponse,
} from '@/types/api-types'
import { getCategorias } from '@/app/actions/orcamento'
import { CategoryBadges } from '@/components/categoryBadges'

// Tipo para categorias da API
type Categoria = {
  ID: string
  Nome: string
  createdAt?: string
  updatedAt?: string
}

export default function CompararOrcamentosPage() {
  // Estados
  const [categorias, setCategorias] = useState<string[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('')
  const [comparacao, setComparacao] =
    useState<ComparacaoOrcamentosResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  // Validação de resposta do backend para comparação
  const validateComparacaoResponse = (data: any): data is ComparacaoOrcamentosResponse => {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.categoria === 'string' &&
      typeof data.descripcion === 'string' &&
      Array.isArray(data.orcamentos) &&
      typeof data.total === 'number' &&
      data.orcamentos.every((orc: any) =>
        typeof orc.id === 'string' &&
        typeof orc.numero === 'string' &&
        typeof orc.valorTotal === 'number' &&
        typeof orc.status === 'string' &&
        typeof orc.dataEmissao === 'string' &&
        typeof orc.obraId === 'string' &&
        typeof orc.obraNome === 'string' &&
        typeof orc.fornecedorId === 'string' &&
        typeof orc.fornecedorNome === 'string' &&
        typeof orc.itensCount === 'number' &&
        Array.isArray(orc.categorias) &&
        orc.categorias.every((cat: any) =>
          typeof cat.ID === 'string' &&
          typeof cat.Nome === 'string'
        )
      )
    )
  }

  // Carregar categorias disponíveis
  const carregarCategorias = async () => {
    setLoadingCategorias(true)
    try {
      const result = await getCategorias()

      if ('error' in result) {
        throw new Error(result.error)
      }

      // Validar e extrair nomes das categorias
      if (Array.isArray(result)) {
        const nomesCategoria = result
          .filter((cat): cat is Categoria => cat && typeof cat === 'object' && 'Nome' in cat)
          .map(cat => cat.Nome)
          .filter(nome => typeof nome === 'string' && nome.trim() !== '')

        if (nomesCategoria.length === 0) {
          throw new Error('Nenhuma categoria válida encontrada')
        }

        setCategorias(nomesCategoria)
      } else {
        throw new Error('Formato de resposta inválido para categorias')
      }
    } catch (error) {
      console.error('💥 Erro ao carregar categorias:', error)
      // Fallback para categorias mock se necessário
      setCategorias(['Cimento', 'Areia', 'Brita', 'Ferro', 'Madeira'])
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar categorias',
        variant: 'destructive'
      })
    } finally {
      setLoadingCategorias(false)
    }
  }

  // Função para gerar comparação
  const gerarComparacao = async () => {
    if (!categoriaSelecionada) return

    setLoading(true)
    try {
      console.log(
        '🔍 Comparando orçamentos para categoria:',
        categoriaSelecionada
      )
      const result = await compararOrcamentosPorCategoria(categoriaSelecionada)

      if (result.success && result.data) {
        // Validar resposta do backend
        if (!validateComparacaoResponse(result.data)) {
          throw new Error('Formato de resposta inválido do servidor')
        }

        // Validar se a categoria retornada corresponde à solicitada
        if (result.data.categoria !== categoriaSelecionada) {
          console.warn(
            `⚠️ Categoria retornada (${result.data.categoria}) diferente da solicitada (${categoriaSelecionada})`
          )
        }

        // Validar se há orçamentos válidos
        if (!result.data.orcamentos || result.data.orcamentos.length === 0) {
          setComparacao(null)
          toast({
            title: 'Aviso',
            description: 'Nenhum orçamento encontrado para esta categoria',
            variant: 'default'
          })
          return
        }

        // Ordenar por valor total (do menor para o maior)
        const comparacaoOrdenada = {
          ...result.data,
          orcamentos: result.data.orcamentos.sort(
            (a, b) => a.valorTotal - b.valorTotal
          )
        }
        setComparacao(comparacaoOrdenada)

        toast({
          title: 'Sucesso',
          description: `${result.data.orcamentos.length} orçamentos encontrados para ${result.data.categoria}`,
          variant: 'default'
        })
      } else {
        setComparacao(null)
        toast({
          title: 'Erro',
          description: result.message || 'Erro ao comparar orçamentos',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('💥 Erro ao comparar orçamentos:', error)
      setComparacao(null)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao comparar orçamentos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar categorias na inicialização
  useEffect(() => {
    carregarCategorias()
  }, [])

  // Calcular a diferença percentual em relação ao menor valor
  const calcularDiferencaPercentual = (valor: number, menorValor: number) => {
    if (menorValor === 0) return 0
    return ((valor - menorValor) / menorValor) * 100
  }

  // Formatar status do orçamento
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'recusado':
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Comparar Orçamentos por Material
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione uma Categoria para Comparar</CardTitle>
          <CardDescription>
            Compare os orçamentos por categoria de material
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={categoriaSelecionada}
                onValueChange={setCategoriaSelecionada}
                disabled={loadingCategorias}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingCategorias
                        ? 'Carregando...'
                        : 'Selecione uma categoria'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={gerarComparacao}
                disabled={!categoriaSelecionada || loading || loadingCategorias}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Comparando...' : 'Comparar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparacao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Comparação de {comparacao.categoria}
            </CardTitle>
            <CardDescription>
              {comparacao.orcamentos.length} orçamentos encontrados com esta
              categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparacao.orcamentos.map((item, index) => {
                    const menorValor = comparacao.orcamentos[0].valorTotal
                    const diferencaPercentual = calcularDiferencaPercentual(
                      item.valorTotal,
                      menorValor
                    )

                    return (
                      <TableRow
                        key={item.id}
                        className={
                          index === 0 ? 'bg-green-50 dark:bg-green-950/20' : ''
                        }
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/orcamentos/${item.id}`}
                            className="hover:underline"
                          >
                            {item.numero}
                          </Link>
                        </TableCell>
                        <TableCell>{item.fornecedorNome}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.dataEmissao).toLocaleDateString(
                            'pt-BR'
                          )}
                        </TableCell>
                        <TableCell>
                          <CategoryBadges categorias={item.categorias.map(c => c.Nome)} /> 
                        </TableCell>
                        <TableCell className="font-medium">
                          R${' '}
                          {item.valorTotal.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2
                          })}
                        </TableCell>
                        <TableCell>
                          {index === 0 ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                            >
                              Melhor preço
                            </Badge>
                          ) : (
                            <span className="text-red-600">
                              +{diferencaPercentual.toFixed(2)}%
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar Comparação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
