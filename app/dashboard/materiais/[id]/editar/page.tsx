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
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Tipo para material
type Material = {
  id: number
  codigo: string
  nome: string
  categoria: string
  unidade: string
  preco: number
  estoque: number
  fornecedor: string
  status: string
  estoqueMinimo?: number
  localizacao?: string
  descricao?: string
}

// Dados de exemplo
const materiaisIniciais: Material[] = [
  {
    id: 1,
    codigo: "MAT-001",
    nome: "Cimento Portland CP II",
    categoria: "Cimento",
    unidade: "Saco 50kg",
    preco: 32.5,
    estoque: 120,
    fornecedor: "Materiais Premium Ltda",
    status: "Disponível",
    estoqueMinimo: 20,
    localizacao: "Prateleira A, Seção 1",
    descricao: "Cimento Portland CP II para uso geral em construção civil.",
  },
  {
    id: 2,
    codigo: "MAT-002",
    nome: "Tijolo Cerâmico 9x19x19",
    categoria: "Alvenaria",
    unidade: "Milheiro",
    preco: 850.0,
    estoque: 15,
    fornecedor: "Materiais Premium Ltda",
    status: "Disponível",
    estoqueMinimo: 5,
    localizacao: "Pátio Externo, Área 2",
    descricao: "Tijolo cerâmico 9x19x19cm para alvenaria de vedação.",
  },
  {
    id: 3,
    codigo: "MAT-003",
    nome: "Areia Média Lavada",
    categoria: "Agregados",
    unidade: "m³",
    preco: 120.0,
    estoque: 35,
    fornecedor: "Materiais Premium Ltda",
    status: "Disponível",
    estoqueMinimo: 10,
    localizacao: "Pátio Externo, Área 1",
    descricao: "Areia média lavada para uso em concretos e argamassas.",
  },
  {
    id: 4,
    codigo: "MAT-004",
    nome: "Brita nº 1",
    categoria: "Agregados",
    unidade: "m³",
    preco: 135.0,
    estoque: 28,
    fornecedor: "Materiais Premium Ltda",
    status: "Disponível",
    estoqueMinimo: 8,
    localizacao: "Pátio Externo, Área 1",
    descricao: "Brita nº 1 para uso em concretos e drenagens.",
  },
  {
    id: 5,
    codigo: "MAT-005",
    nome: "Vergalhão CA-50 10mm",
    categoria: "Aço",
    unidade: "Barra 12m",
    preco: 45.8,
    estoque: 200,
    fornecedor: "Materiais Premium Ltda",
    status: "Disponível",
    estoqueMinimo: 30,
    localizacao: "Prateleira B, Seção 3",
    descricao: "Vergalhão de aço CA-50 com 10mm de diâmetro para estruturas de concreto armado.",
  },
  {
    id: 6,
    codigo: "MAT-006",
    nome: "Piso Porcelanato 60x60",
    categoria: "Acabamentos",
    unidade: "m²",
    preco: 89.9,
    estoque: 320,
    fornecedor: "Mármores & Granitos SA",
    status: "Disponível",
    estoqueMinimo: 50,
    localizacao: "Prateleira D, Seção 2",
    descricao: "Piso porcelanato 60x60cm acetinado para áreas internas.",
  },
  {
    id: 7,
    codigo: "MAT-007",
    nome: "Tinta Acrílica Premium",
    categoria: "Pintura",
    unidade: "Lata 18L",
    preco: 289.0,
    estoque: 45,
    fornecedor: "Materiais Premium Ltda",
    status: "Disponível",
    estoqueMinimo: 10,
    localizacao: "Prateleira C, Seção 1",
    descricao: "Tinta acrílica premium para áreas internas e externas.",
  },
  {
    id: 8,
    codigo: "MAT-008",
    nome: "Mármore Carrara",
    categoria: "Acabamentos",
    unidade: "m²",
    preco: 950.0,
    estoque: 8,
    fornecedor: "Mármores & Granitos SA",
    status: "Baixo Estoque",
    estoqueMinimo: 10,
    localizacao: "Prateleira D, Seção 3",
    descricao: "Mármore Carrara importado para bancadas e revestimentos de alto padrão.",
  },
  {
    id: 9,
    codigo: "MAT-009",
    nome: "Cabo Flexível 2,5mm²",
    categoria: "Elétrica",
    unidade: "Rolo 100m",
    preco: 189.0,
    estoque: 25,
    fornecedor: "Elétrica Total",
    status: "Disponível",
    estoqueMinimo: 5,
    localizacao: "Prateleira E, Seção 1",
    descricao: "Cabo flexível 2,5mm² para instalações elétricas residenciais.",
  },
  {
    id: 10,
    codigo: "MAT-010",
    nome: "Tubo PVC 100mm",
    categoria: "Hidráulica",
    unidade: "Barra 6m",
    preco: 98.5,
    estoque: 30,
    fornecedor: "Hidráulica Express",
    status: "Disponível",
    estoqueMinimo: 8,
    localizacao: "Prateleira F, Seção 2",
    descricao: "Tubo PVC 100mm para instalações de esgoto.",
  },
]

// Lista de categorias disponíveis
const categorias = [
  "Cimento",
  "Alvenaria",
  "Agregados",
  "Aço",
  "Acabamentos",
  "Pintura",
  "Elétrica",
  "Hidráulica",
  "Madeiras",
  "Outros",
]

// Lista de unidades de medida disponíveis
const unidades = [
  "Saco 50kg",
  "Milheiro",
  "m³",
  "m²",
  "m",
  "kg",
  "Barra 12m",
  "Barra 6m",
  "Lata 18L",
  "Lata 3.6L",
  "Rolo 100m",
  "Unidade",
  "Pacote",
  "Caixa",
]

// Lista de fornecedores disponíveis
const fornecedores = [
  "Materiais Premium Ltda",
  "Mármores & Granitos SA",
  "Elétrica Total",
  "Hidráulica Express",
  "Madeiras Nobres",
]

export default function EditarMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = Number.parseInt(params.id)

  // Encontrar o material pelo ID
  const materialOriginal = materiaisIniciais.find((m) => m.id === id)

  // Estado para os dados do formulário
  const [formData, setFormData] = useState<Material>({
    id: 0,
    codigo: "",
    nome: "",
    categoria: "",
    unidade: "",
    preco: 0,
    estoque: 0,
    fornecedor: "",
    status: "Disponível",
    estoqueMinimo: 0,
    localizacao: "",
    descricao: "",
  })

  // Carregar dados do material quando o componente montar
  useEffect(() => {
    if (materialOriginal) {
      setFormData(materialOriginal)
    }
  }, [materialOriginal])

  // Função para atualizar o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "preco" || id === "estoque" || id === "estoqueMinimo" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  // Função para atualizar campos de select
  const handleSelectChange = (field: keyof Material, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Função para atualizar o status com base no estoque
  useEffect(() => {
    if (formData.estoqueMinimo && formData.estoque <= formData.estoqueMinimo) {
      setFormData((prev) => ({
        ...prev,
        status: "Baixo Estoque",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        status: "Disponível",
      }))
    }
  }, [formData.estoque, formData.estoqueMinimo])

  // Função para salvar as alterações
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aqui você implementaria a lógica para salvar as alterações no backend
    // Por enquanto, apenas mostraremos um toast de sucesso

    toast({
      title: "Material atualizado",
      description: `As informações de ${formData.nome} foram atualizadas com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })

    // Redirecionar para a lista de materiais
    router.push("/dashboard/materiais")
  }

  // Se o material não for encontrado
  if (!materialOriginal) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/materiais">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Material não encontrado</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/materiais">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Editar Material</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" placeholder="Código do material" value={formData.codigo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Nome do material" value={formData.nome} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
                  <SelectTrigger id="categoria">
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
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade de Medida</Label>
                <Select value={formData.unidade} onValueChange={(value) => handleSelectChange("unidade", value)}>
                  <SelectTrigger id="unidade">
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço Unitário (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.preco}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque">Quantidade em Estoque</Label>
                <Input
                  id="estoque"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.estoque}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Select value={formData.fornecedor} onValueChange={(value) => handleSelectChange("fornecedor", value)}>
                <SelectTrigger id="fornecedor">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor} value={fornecedor}>
                      {fornecedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                min="0"
                placeholder="0"
                value={formData.estoqueMinimo}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização no Depósito</Label>
              <Input
                id="localizacao"
                placeholder="Ex: Prateleira A, Seção 3"
                value={formData.localizacao}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição detalhada do material"
                value={formData.descricao}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    formData.status === "Disponível" ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span>{formData.status}</span>
                <span className="text-sm text-muted-foreground">(Atualizado automaticamente com base no estoque)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/materiais">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
