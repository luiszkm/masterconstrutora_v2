"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Package } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Tipo para material em orçamento
type MaterialOrcamento = {
  id: number
  nome: string
  quantidade: number
  unidade: string
  valorUnitario: number
  valorTotal: number
  fornecedor: string
}

// Tipo para orçamento
type Orcamento = {
  id: number
  numero: string
  cliente: string
  projeto: string
  valor: string
  data: string
  status: string
  materiais: MaterialOrcamento[]
}

// Tipo para comparação de material
type ComparacaoMaterial = {
  material: string
  orcamentos: {
    id: number
    numero: string
    fornecedor: string
    quantidade: number
    unidade: string
    valorUnitario: number
    valorTotal: number
  }[]
}

// Dados de exemplo
const orcamentosIniciais: Orcamento[] = [
  {
    id: 1,
    numero: "ORC-2023-101",
    cliente: "Roberto Mendes",
    projeto: "Mansão Alphaville",
    valor: "R$ 2.500.000,00",
    data: "10/01/2023",
    status: "Aprovado",
    materiais: [
      {
        id: 1,
        nome: "Cimento",
        quantidade: 500,
        unidade: "Saco 50kg",
        valorUnitario: 32.5,
        valorTotal: 16250,
        fornecedor: "Materiais Premium Ltda",
      },
      {
        id: 2,
        nome: "Areia",
        quantidade: 120,
        unidade: "m³",
        valorUnitario: 120,
        valorTotal: 14400,
        fornecedor: "Materiais Premium Ltda",
      },
      {
        id: 3,
        nome: "Aço",
        quantidade: 2000,
        unidade: "kg",
        valorUnitario: 8.5,
        valorTotal: 17000,
        fornecedor: "Materiais Premium Ltda",
      },
    ],
  },
  {
    id: 2,
    numero: "ORC-2023-102",
    cliente: "Carla Oliveira",
    projeto: "Residência Beira-Mar",
    valor: "R$ 1.800.000,00",
    data: "22/02/2023",
    status: "Pendente",
    materiais: [
      {
        id: 4,
        nome: "Mármores",
        quantidade: 80,
        unidade: "m²",
        valorUnitario: 950,
        valorTotal: 76000,
        fornecedor: "Mármores & Granitos SA",
      },
      {
        id: 5,
        nome: "Porcelanatos",
        quantidade: 200,
        unidade: "m²",
        valorUnitario: 89.9,
        valorTotal: 17980,
        fornecedor: "Mármores & Granitos SA",
      },
    ],
  },
  {
    id: 3,
    numero: "ORC-2023-103",
    cliente: "Fernando Almeida",
    projeto: "Cobertura Duplex",
    valor: "R$ 950.000,00",
    data: "15/03/2023",
    status: "Aprovado",
    materiais: [
      {
        id: 6,
        nome: "Cabos",
        quantidade: 1000,
        unidade: "m",
        valorUnitario: 5.8,
        valorTotal: 5800,
        fornecedor: "Elétrica Total",
      },
      {
        id: 7,
        nome: "Disjuntores",
        quantidade: 30,
        unidade: "un",
        valorUnitario: 45.9,
        valorTotal: 1377,
        fornecedor: "Elétrica Total",
      },
    ],
  },
  {
    id: 4,
    numero: "ORC-2023-104",
    cliente: "Juliana Martins",
    projeto: "Refúgio na Serra",
    valor: "R$ 1.200.000,00",
    data: "05/04/2023",
    status: "Em análise",
    materiais: [
      {
        id: 8,
        nome: "Madeira Maciça",
        quantidade: 50,
        unidade: "m³",
        valorUnitario: 2800,
        valorTotal: 140000,
        fornecedor: "Madeiras Nobres",
      },
      {
        id: 9,
        nome: "Deck",
        quantidade: 120,
        unidade: "m²",
        valorUnitario: 350,
        valorTotal: 42000,
        fornecedor: "Madeiras Nobres",
      },
    ],
  },
  {
    id: 5,
    numero: "ORC-2023-105",
    cliente: "Ricardo Souza",
    projeto: "Mansão Neoclássica",
    valor: "R$ 3.100.000,00",
    data: "18/05/2023",
    status: "Recusado",
    materiais: [
      {
        id: 10,
        nome: "Cimento",
        quantidade: 800,
        unidade: "Saco 50kg",
        valorUnitario: 31.8,
        valorTotal: 25440,
        fornecedor: "Materiais Premium Ltda",
      },
      {
        id: 11,
        nome: "Granitos",
        quantidade: 150,
        unidade: "m²",
        valorUnitario: 850,
        valorTotal: 127500,
        fornecedor: "Mármores & Granitos SA",
      },
    ],
  },
]

export default function CompararOrcamentosPage() {
  // Estado para orçamentos
  const [orcamentos] = useState<Orcamento[]>(orcamentosIniciais)

  // Estado para material selecionado
  const [materialSelecionado, setMaterialSelecionado] = useState<string>("")

  // Estado para comparação
  const [comparacao, setComparacao] = useState<ComparacaoMaterial | null>(null)

  // Obter todos os materiais únicos
  const materiais = Array.from(new Set(orcamentos.flatMap((o) => o.materiais.map((m) => m.nome)))).sort()

  // Função para gerar comparação
  const gerarComparacao = () => {
    if (!materialSelecionado) return

    const orcamentosComMaterial = orcamentos.filter((o) => o.materiais.some((m) => m.nome === materialSelecionado))

    const comparacaoData: ComparacaoMaterial = {
      material: materialSelecionado,
      orcamentos: orcamentosComMaterial.map((o) => {
        const material = o.materiais.find((m) => m.nome === materialSelecionado)!
        return {
          id: o.id,
          numero: o.numero,
          fornecedor: material.fornecedor,
          quantidade: material.quantidade,
          unidade: material.unidade,
          valorUnitario: material.valorUnitario,
          valorTotal: material.valorTotal,
        }
      }),
    }

    // Ordenar por valor unitário (do menor para o maior)
    comparacaoData.orcamentos.sort((a, b) => a.valorUnitario - b.valorUnitario)

    setComparacao(comparacaoData)
  }

  // Gerar comparação quando o material selecionado muda
  useEffect(() => {
    if (materialSelecionado) {
      gerarComparacao()
    } else {
      setComparacao(null)
    }
  }, [materialSelecionado])

  // Calcular a diferença percentual em relação ao menor valor
  const calcularDiferencaPercentual = (valor: number, menorValor: number) => {
    if (menorValor === 0) return 0
    return ((valor - menorValor) / menorValor) * 100
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Comparar Orçamentos por Material</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione um Material para Comparar</CardTitle>
          <CardDescription>Compare os preços e condições do mesmo material em diferentes orçamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um material" />
                </SelectTrigger>
                <SelectContent>
                  {materiais.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={gerarComparacao} disabled={!materialSelecionado}>
                Comparar
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
              Comparação de {comparacao.material}
            </CardTitle>
            <CardDescription>{comparacao.orcamentos.length} orçamentos encontrados com este material</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparacao.orcamentos.map((item, index) => {
                    const menorValor = comparacao.orcamentos[0].valorUnitario
                    const diferencaPercentual = calcularDiferencaPercentual(item.valorUnitario, menorValor)

                    return (
                      <TableRow key={item.id} className={index === 0 ? "bg-green-50 dark:bg-green-950/20" : ""}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/orcamentos/${item.id}`} className="hover:underline">
                            {item.numero}
                          </Link>
                        </TableCell>
                        <TableCell>{item.fornecedor}</TableCell>
                        <TableCell>
                          {item.quantidade} {item.unidade}
                        </TableCell>
                        <TableCell>
                          R$ {item.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          R$ {item.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                            <span className="text-red-600">+{diferencaPercentual.toFixed(2)}%</span>
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
