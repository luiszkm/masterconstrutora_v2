"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Filter, ChevronUp, ChevronDown, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  },
]

// Tipo para ordenação
type SortConfig = {
  key: string
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  [key: string]: string | string[]
}

export default function MateriaisPage() {
  // Estado para materiais
  const [materiais, setMateriais] = useState<Material[]>(materiaisIniciais)

  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })

  // Estado para filtros
  const [filters, setFilters] = useState<Filters>({})

  // Estado para materiais filtrados
  const [filteredMateriais, setFilteredMateriais] = useState(materiais)

  // Estado para o diálogo de edição rápida
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false)
  const [materialSelecionado, setMaterialSelecionado] = useState<Material | null>(null)
  const [novoEstoque, setNovoEstoque] = useState<number>(0)
  const [novoPreco, setNovoPreco] = useState<number>(0)

  // Função para ordenar
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    // Aplicar ordenação
    const sortedData = [...filteredMateriais].sort((a, b) => {
      // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1
      }
      // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredMateriais(sortedData)
  }

  // Função para aplicar filtros
  const applyFilters = () => {
    let result = materiais

    // Aplicar filtros específicos
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key]
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        // Para filtros de array
        result = result.filter((material) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = material[key]
          if (Array.isArray(value)) {
            return value.some((v) => filterValue.includes(v))
          }
          return false
        })
      } else if (filterValue && typeof filterValue === "string" && filterValue !== "") {
        // Para filtros de string
        result = result.filter((material) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = material[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    })

    setFilteredMateriais(result)
  }

  // Aplicar filtros quando mudam
  useState(() => {
    applyFilters()
  }, [filters])

  // Função para abrir o diálogo de edição rápida
  const abrirDialogoEditar = (material: Material) => {
    setMaterialSelecionado(material)
    setNovoEstoque(material.estoque)
    setNovoPreco(material.preco)
    setDialogEditarAberto(true)
  }

  // Função para salvar as alterações da edição rápida
  const salvarEdicaoRapida = () => {
    if (!materialSelecionado) return

    // Atualizar o material
    const materiaisAtualizados = materiais.map((material) => {
      if (material.id === materialSelecionado.id) {
        return {
          ...material,
          estoque: novoEstoque,
          preco: novoPreco,
          status: novoEstoque <= 10 ? "Baixo Estoque" : "Disponível",
        }
      }
      return material
    })

    // Atualizar estado
    setMateriais(materiaisAtualizados)
    setFilteredMateriais(
      filteredMateriais.map((material) => {
        if (material.id === materialSelecionado.id) {
          return {
            ...material,
            estoque: novoEstoque,
            preco: novoPreco,
            status: novoEstoque <= 10 ? "Baixo Estoque" : "Disponível",
          }
        }
        return material
      }),
    )

    // Fechar diálogo
    setDialogEditarAberto(false)

    // Mostrar toast de sucesso
    toast({
      title: "Material atualizado",
      description: `${materialSelecionado.nome} foi atualizado com sucesso.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (key: string, label: string) => (
    <TableHead>
      <button className="flex items-center gap-1 hover:text-primary" onClick={() => requestSort(key)}>
        {label}
        {sortConfig.key === key ? (
          sortConfig.direction === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <div className="w-4" />
        )}
      </button>
    </TableHead>
  )

  // Função para pesquisar materiais
  const searchMateriais = (term: string) => {
    if (!term) {
      setFilteredMateriais(materiais)
      return
    }

    const filtered = materiais.filter(
      (material) =>
        material.nome.toLowerCase().includes(term.toLowerCase()) ||
        material.codigo.toLowerCase().includes(term.toLowerCase()) ||
        material.categoria.toLowerCase().includes(term.toLowerCase()) ||
        material.fornecedor.toLowerCase().includes(term.toLowerCase()),
    )

    setFilteredMateriais(filtered)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Materiais</h2>
        <Button asChild>
          <Link href="/dashboard/materiais/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Material
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar materiais..."
            className="w-full pl-8"
            onChange={(e) => searchMateriais(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrar por</h4>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Categoria</h5>
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      {Array.from(new Set(materiais.map((m) => m.categoria))).map((categoria) => (
                        <CommandItem key={categoria}>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.categoria === categoria}
                              onChange={(e) => {
                                setFilters({
                                  ...filters,
                                  categoria: e.target.checked ? categoria : "",
                                })
                                applyFilters()
                              }}
                              className="h-4 w-4"
                            />
                            {categoria}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Fornecedor</h5>
                <Command>
                  <CommandInput placeholder="Buscar fornecedor..." />
                  <CommandList>
                    <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                    <CommandGroup>
                      {Array.from(new Set(materiais.map((m) => m.fornecedor))).map((fornecedor) => (
                        <CommandItem key={fornecedor}>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.fornecedor === fornecedor}
                              onChange={(e) => {
                                setFilters({
                                  ...filters,
                                  fornecedor: e.target.checked ? fornecedor : "",
                                })
                                applyFilters()
                              }}
                              className="h-4 w-4"
                            />
                            {fornecedor}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Status</h5>
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {Array.from(new Set(materiais.map((m) => m.status))).map((status) => (
                        <CommandItem key={status}>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.status === status}
                              onChange={(e) => {
                                setFilters({
                                  ...filters,
                                  status: e.target.checked ? status : "",
                                })
                                applyFilters()
                              }}
                              className="h-4 w-4"
                            />
                            {status}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({})
                    setFilteredMateriais(materiais)
                  }}
                >
                  Limpar Filtros
                </Button>
                <Button size="sm" onClick={() => applyFilters()}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortableHeader("codigo", "Código")}
              {renderSortableHeader("nome", "Nome")}
              {renderSortableHeader("categoria", "Categoria")}
              {renderSortableHeader("unidade", "Unidade")}
              {renderSortableHeader("preco", "Preço")}
              {renderSortableHeader("estoque", "Estoque")}
              {renderSortableHeader("fornecedor", "Fornecedor")}
              {renderSortableHeader("status", "Status")}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMateriais.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum material encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredMateriais.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.codigo}</TableCell>
                  <TableCell>{material.nome}</TableCell>
                  <TableCell>{material.categoria}</TableCell>
                  <TableCell>{material.unidade}</TableCell>
                  <TableCell>R$ {material.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{material.estoque}</TableCell>
                  <TableCell>{material.fornecedor}</TableCell>
                  <TableCell>
                    <Badge variant={material.status === "Disponível" ? "default" : "secondary"}>
                      {material.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirDialogoEditar(material)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edição Rápida
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/materiais/${material.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Completo
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para edição rápida */}
      <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edição Rápida de Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {materialSelecionado && (
              <>
                <div className="space-y-1">
                  <h4 className="font-medium">{materialSelecionado.nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    {materialSelecionado.codigo} - {materialSelecionado.categoria}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estoque">Quantidade em Estoque</Label>
                  <Input
                    id="estoque"
                    type="number"
                    min="0"
                    value={novoEstoque}
                    onChange={(e) => setNovoEstoque(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço Unitário (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoPreco}
                    onChange={(e) => setNovoPreco(Number(e.target.value))}
                  />
                </div>
                {novoEstoque <= 10 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>Estoque baixo! Este material será marcado como "Baixo Estoque".</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicaoRapida}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
