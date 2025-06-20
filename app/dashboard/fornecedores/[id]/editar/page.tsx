"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star, Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// Tipos de materiais para cada fornecedor
type MaterialTipo = {
  id: number
  nome: string
}

// Tipo para fornecedor
type Fornecedor = {
  id: number
  nome: string
  cnpj: string
  categoria: string
  website: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  contato: string
  cargo: string
  email: string
  telefone: string
  avaliacao: number
  observacoes: string
  materiais: MaterialTipo[]
}

// Lista de todos os tipos de materiais disponíveis no sistema
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

// Dados de exemplo para o fornecedor
const fornecedor: Fornecedor = {
  id: 1,
  nome: "Materiais Premium Ltda",
  cnpj: "12.345.678/0001-90",
  categoria: "materiais",
  website: "www.materiaispremium.com.br",
  endereco: "Av. Industrial, 1500",
  cidade: "São Paulo",
  estado: "SP",
  cep: "04000-000",
  contato: "Carlos Rodrigues",
  cargo: "Gerente Comercial",
  email: "carlos@materiaispremium.com.br",
  telefone: "(11) 98765-4321",
  avaliacao: 5,
  observacoes: "Fornecedor de materiais de construção de alta qualidade. Parceria desde 2015.",
  materiais: [
    { id: 1, nome: "Cimento" },
    { id: 2, nome: "Areia" },
    { id: 3, nome: "Brita" },
    { id: 4, nome: "Aço" },
    { id: 5, nome: "Tintas" },
  ],
}

export default function EditarFornecedorPage({ params }: { params: { id: string } }) {
  // Estado para o fornecedor
  const [fornecedorData, setFornecedorData] = useState<Fornecedor>(fornecedor)

  // Estado para o diálogo de adicionar material
  const [dialogOpen, setDialogOpen] = useState(false)

  // Estado para o novo material
  const [novoMaterial, setNovoMaterial] = useState("")

  // Estado para pesquisa de material
  const [materialPesquisa, setMaterialPesquisa] = useState("")

  // Estado para erro de material duplicado
  const [materialDuplicado, setMaterialDuplicado] = useState(false)

  // Função para atualizar o fornecedor
  const atualizarFornecedor = (campo: keyof Fornecedor, valor: any) => {
    setFornecedorData({
      ...fornecedorData,
      [campo]: valor,
    })
  }

  // Função para adicionar material
  const adicionarMaterial = (e?: React.MouseEvent) => {
    if (e) e.preventDefault() // Prevenir comportamento padrão do botão

    if (!novoMaterial) return

    // Verificar se o material já existe para este fornecedor
    const materialExistente = fornecedorData.materiais.some((m) => m.nome.toLowerCase() === novoMaterial.toLowerCase())

    if (materialExistente) {
      setMaterialDuplicado(true)
      return
    }

    // Criar novo material
    const novoMaterialObj: MaterialTipo = {
      id: Math.max(...fornecedorData.materiais.map((m) => m.id), 0) + 1,
      nome: novoMaterial,
    }

    // Atualizar fornecedor
    setFornecedorData({
      ...fornecedorData,
      materiais: [...fornecedorData.materiais, novoMaterialObj],
    })

    // Fechar diálogo
    setDialogOpen(false)
    setNovoMaterial("")
    setMaterialDuplicado(false)

    // Mostrar toast de sucesso
    toast({
      title: "Material adicionado com sucesso",
      description: `${novoMaterial} foi adicionado à lista de materiais de ${fornecedorData.nome}.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para remover material
  const removerMaterial = (id: number) => {
    setFornecedorData({
      ...fornecedorData,
      materiais: fornecedorData.materiais.filter((m) => m.id !== id),
    })

    toast({
      title: "Material removido",
      description: "O material foi removido com sucesso.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para salvar o fornecedor
  const salvarFornecedor = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir comportamento padrão do botão

    // Aqui você implementaria a lógica para salvar o fornecedor no backend
    toast({
      title: "Fornecedor atualizado",
      description: "As alterações foram salvas com sucesso.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para renderizar as estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    // Adiciona estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <button
          key={`full-${i}`}
          type="button"
          className="focus:outline-none"
          onClick={() => atualizarFornecedor("avaliacao", i + 1)}
        >
          <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
        </button>,
      )
    }

    // Adiciona meia estrela se necessário
    if (hasHalfStar) {
      stars.push(
        <button
          key="half"
          type="button"
          className="focus:outline-none"
          onClick={() => atualizarFornecedor("avaliacao", fullStars + 0.5)}
        >
          <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
        </button>,
      )
    }

    // Adiciona estrelas vazias
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <button
          key={`empty-${i}`}
          type="button"
          className="focus:outline-none"
          onClick={() => atualizarFornecedor("avaliacao", Math.ceil(rating) + i + 1)}
        >
          <Star className="h-6 w-6 text-yellow-500" />
        </button>,
      )
    }

    return <div className="flex">{stars}</div>
  }

  // Filtrar materiais disponíveis (que não estão já associados ao fornecedor)
  const materiaisDisponiveis = tiposMateriais.filter(
    (material) => !fornecedorData.materiais.some((m) => m.nome.toLowerCase() === material.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/fornecedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Editar Fornecedor</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input
                  id="nome"
                  placeholder="Nome do fornecedor"
                  value={fornecedorData.nome}
                  onChange={(e) => atualizarFornecedor("nome", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={fornecedorData.cnpj}
                  onChange={(e) => atualizarFornecedor("cnpj", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={fornecedorData.categoria}
                  onValueChange={(value) => atualizarFornecedor("categoria", value)}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materiais">Materiais de Construção</SelectItem>
                    <SelectItem value="acabamentos">Acabamentos</SelectItem>
                    <SelectItem value="eletrica">Instalações Elétricas</SelectItem>
                    <SelectItem value="hidraulica">Instalações Hidráulicas</SelectItem>
                    <SelectItem value="madeiras">Madeiras</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="www.exemplo.com.br"
                  value={fornecedorData.website}
                  onChange={(e) => atualizarFornecedor("website", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                placeholder="Endereço completo"
                value={fornecedorData.endereco}
                onChange={(e) => atualizarFornecedor("endereco", e.target.value)}
              />
            </div>
          
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contato">Nome do Contato</Label>
                <Input
                  id="contato"
                  placeholder="Nome da pessoa de contato"
                  value={fornecedorData.contato}
                  onChange={(e) => atualizarFornecedor("contato", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  placeholder="Cargo do contato"
                  value={fornecedorData.cargo}
                  onChange={(e) => atualizarFornecedor("cargo", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={fornecedorData.email}
                  onChange={(e) => atualizarFornecedor("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={fornecedorData.telefone}
                  onChange={(e) => atualizarFornecedor("telefone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avaliação</Label>
              <div className="flex items-center gap-2">{renderStars(fornecedorData.avaliacao)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Materiais Fornecidos</Label>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} type="button">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Material
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedorData.materiais.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Nenhum material cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fornecedorData.materiais.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>{material.nome}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerMaterial(material.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remover</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o fornecedor"
                value={fornecedorData.observacoes}
                onChange={(e) => atualizarFornecedor("observacoes", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/fornecedores">Cancelar</Link>
            </Button>
            <Button type="button" onClick={salvarFornecedor}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo para adicionar material */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {materialDuplicado && (
              <div className="rounded-md bg-destructive/15 p-3 text-destructive">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Este material já está associado a este fornecedor.</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {novoMaterial || "Selecione um material"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar material..."
                      value={materialPesquisa}
                      onValueChange={setMaterialPesquisa}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {materiaisDisponiveis
                          .filter((material) => material.toLowerCase().includes(materialPesquisa.toLowerCase()))
                          .map((material) => (
                            <CommandItem
                              key={material}
                              value={material}
                              onSelect={() => {
                                setNovoMaterial(material)
                                setMaterialPesquisa("")
                              }}
                            >
                              {material}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setNovoMaterial("")
                setMaterialDuplicado(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={adicionarMaterial} disabled={!novoMaterial || materiaisDisponiveis.length === 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
