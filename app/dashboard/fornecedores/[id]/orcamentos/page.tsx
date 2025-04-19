"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Eye, Plus, ChevronUp, ChevronDown, Filter, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"

// Dados de exemplo para o fornecedor
const fornecedor = {
  id: 1,
  nome: "Materiais Premium Ltda",
}

// Tipo para orçamento
type Orcamento = {
  id: number
  numero: string
  data: string
  valor: string
  projeto: string
  status: string
}

// Dados de exemplo para os orçamentos do fornecedor
const orcamentos: Orcamento[] = [
  {
    id: 101,
    numero: "ORC-2023-101",
    data: "15/01/2023",
    valor: "R$ 45.000,00",
    projeto: "Mansão Alphaville",
    status: "Aprovado",
  },
  {
    id: 102,
    numero: "ORC-2023-102",
    data: "22/02/2023",
    valor: "R$ 28.500,00",
    projeto: "Residência Beira-Mar",
    status: "Aprovado",
  },
  {
    id: 103,
    numero: "ORC-2023-103",
    data: "10/03/2023",
    valor: "R$ 15.750,00",
    projeto: "Cobertura Duplex",
    status: "Pendente",
  },
  {
    id: 104,
    numero: "ORC-2023-104",
    data: "05/04/2023",
    valor: "R$ 32.200,00",
    projeto: "Refúgio na Serra",
    status: "Em análise",
  },
  {
    id: 105,
    numero: "ORC-2023-105",
    data: "18/05/2023",
    valor: "R$ 52.800,00",
    projeto: "Mansão Neoclássica",
    status: "Aprovado",
  },
  {
    id: 106,
    numero: "ORC-2023-106",
    data: "30/06/2023",
    valor: "R$ 18.900,00",
    projeto: "Residência Minimalista",
    status: "Recusado",
  },
  {
    id: 107,
    numero: "ORC-2023-107",
    data: "12/07/2023",
    valor: "R$ 41.300,00",
    projeto: "Mansão Alphaville",
    status: "Aprovado",
  },
  {
    id: 108,
    numero: "ORC-2023-108",
    data: "25/08/2023",
    valor: "R$ 23.600,00",
    projeto: "Cobertura Duplex",
    status: "Pendente",
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

export default function OrcamentosFornecedorPage({ params }: { params: { id: string } }) {
  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })

  // Estado para filtros
  const [filters, setFilters] = useState<Filters>({})

  // Estado para orçamentos filtrados
  const [filteredOrcamentos, setFilteredOrcamentos] = useState(orcamentos)

  // Estado para pesquisa global
  const [searchTerm, setSearchTerm] = useState("")

  // Função para ordenar
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    // Aplicar ordenação
    const sortedData = [...filteredOrcamentos].sort((a, b) => {
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

    setFilteredOrcamentos(sortedData)
  }

  // Função para aplicar filtros
  const applyFilters = () => {
    let result = [...orcamentos]

    // Aplicar pesquisa global
    if (searchTerm) {
      result = result.filter(
        (orcamento) =>
          orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.status.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Aplicar filtros específicos
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key]
      if (filterValue && typeof filterValue === "string" && filterValue !== "") {
        // Para filtros de string
        result = result.filter((orcamento) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = orcamento[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    })

    setFilteredOrcamentos(result)
  }

  // Aplicar filtros quando mudam
  useState(() => {
    applyFilters()
  }, [filters, searchTerm])

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/fornecedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos - {fornecedor.nome}</h2>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Lista de orçamentos relacionados a este fornecedor</p>
        <Button asChild>
          <Link href="/dashboard/orcamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar orçamentos..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <h5 className="text-sm font-medium">Status</h5>
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {Array.from(new Set(orcamentos.map((o) => o.status))).map((status) => (
                        <CommandItem key={status}>
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status === status}
                            onCheckedChange={(checked) => {
                              setFilters({
                                ...filters,
                                status: checked ? status : "",
                              })
                            }}
                          />
                          <label htmlFor={`status-${status}`} className="ml-2 text-sm">
                            {status}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Projeto</h5>
                <Command>
                  <CommandInput placeholder="Buscar projeto..." />
                  <CommandList className="max-h-40 overflow-auto">
                    <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {Array.from(new Set(orcamentos.map((o) => o.projeto))).map((projeto) => (
                        <CommandItem key={projeto}>
                          <Checkbox
                            id={`projeto-${projeto}`}
                            checked={filters.projeto === projeto}
                            onCheckedChange={(checked) => {
                              setFilters({
                                ...filters,
                                projeto: checked ? projeto : "",
                              })
                            }}
                          />
                          <label htmlFor={`projeto-${projeto}`} className="ml-2 text-sm">
                            {projeto}
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
                    setSearchTerm("")
                    setFilteredOrcamentos(orcamentos)
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
              {renderSortableHeader("numero", "Número")}
              {renderSortableHeader("data", "Data")}
              {renderSortableHeader("projeto", "Projeto")}
              {renderSortableHeader("valor", "Valor")}
              {renderSortableHeader("status", "Status")}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrcamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum orçamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrcamentos.map((orcamento) => (
                <TableRow key={orcamento.id}>
                  <TableCell className="font-medium">{orcamento.numero}</TableCell>
                  <TableCell>{orcamento.data}</TableCell>
                  <TableCell>{orcamento.projeto}</TableCell>
                  <TableCell>{orcamento.valor}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        orcamento.status === "Aprovado"
                          ? "default"
                          : orcamento.status === "Pendente"
                            ? "outline"
                            : orcamento.status === "Em análise"
                              ? "secondary"
                              : "destructive"
                      }
                    >
                      {orcamento.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/orcamentos/${orcamento.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Baixar PDF</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
