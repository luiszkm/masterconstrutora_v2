"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, Download, Eye, Filter, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Fornecedor } from "@/types/fornecedor"
import type { OrcamentosResponse, Orcamento } from "@/types/orcamento"

type SortConfig = {
  key: keyof Orcamento
  direction: "asc" | "desc"
}

type Filters = {
  [key: string]: string
}

interface OrcamentosFornecedorClientProps {
  fornecedor: Fornecedor
  initialData: OrcamentosResponse
}

export function OrcamentosFornecedorClient({ fornecedor, initialData }: OrcamentosFornecedorClientProps) {
  const [orcamentos] = useState(initialData.dados)
  const [filteredOrcamentos, setFilteredOrcamentos] = useState(initialData.dados)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "numero", direction: "asc" })
  const [filters, setFilters] = useState<Filters>({})
  const [searchTerm, setSearchTerm] = useState("")

  // Função para ordenar
  const requestSort = (key: keyof Orcamento) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Função para aplicar filtros e ordenação
  const applyFiltersAndSort = () => {
    let result = [...orcamentos]

    // Aplicar pesquisa global
    if (searchTerm) {
      result = result.filter(
        (orcamento) =>
          orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.obraNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orcamento.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Aplicar filtros específicos
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key]
      if (filterValue && filterValue !== "") {
        result = result.filter((orcamento) => {
          const value = orcamento[key as keyof Orcamento]
          if (typeof value === "string") {
            return value.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    })

    // Aplicar ordenação
    result.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredOrcamentos(result)
  }

  // Aplicar filtros quando houver mudanças
  useEffect(() => {
    applyFiltersAndSort()
  }, [filters, searchTerm, sortConfig, orcamentos])

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (key: keyof Orcamento, label: string) => (
    <TableHead>
      <button 
        className="flex items-center gap-1 hover:text-primary" 
        onClick={() => requestSort(key)}
      >
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

  // Função para formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  // Função para obter variant do badge baseado no status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aprovado":
        return "default"
      case "Em Aberto":
        return "outline"
      case "Rejeitado":
        return "destructive"
      case "Cancelado":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <>
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
                <h5 className="text-sm font-medium">Obra</h5>
                <Command>
                  <CommandInput placeholder="Buscar obra..." />
                  <CommandList className="max-h-40 overflow-auto">
                    <CommandEmpty>Nenhuma obra encontrada.</CommandEmpty>
                    <CommandGroup>
                      {Array.from(new Set(orcamentos.map((o) => o.obraNome))).map((obra) => (
                        <CommandItem key={obra}>
                          <Checkbox
                            id={`obra-${obra}`}
                            checked={filters.obraNome === obra}
                            onCheckedChange={(checked) => {
                              setFilters({
                                ...filters,
                                obraNome: checked ? obra : "",
                              })
                            }}
                          />
                          <label htmlFor={`obra-${obra}`} className="ml-2 text-sm">
                            {obra}
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
                  }}
                >
                  Limpar Filtros
                </Button>
                <Button size="sm" onClick={() => applyFiltersAndSort()}>
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
              {renderSortableHeader("dataEmissao", "Data")}
              {renderSortableHeader("obraNome", "Obra")}
              {renderSortableHeader("valorTotal", "Valor")}
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
                  <TableCell>{formatDate(orcamento.dataEmissao)}</TableCell>
                  <TableCell>{orcamento.obraNome}</TableCell>
                  <TableCell>{formatCurrency(orcamento.valorTotal)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(orcamento.status)}>
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

      {initialData.paginacao && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredOrcamentos.length} de {initialData.paginacao.totalItens} orçamentos
        </div>
      )}
    </>
  )
}