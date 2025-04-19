"use client"

import { useState, type ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, ChevronUp, ChevronDown } from "lucide-react"

// Tipo para configuração de colunas
export type ColumnDef<T> = {
  accessorKey: string
  header: string
  cell: (item: T) => ReactNode
  enableSorting?: boolean
  enableFiltering?: boolean
  filterOptions?: string[]
}

// Tipo para ordenação
type SortConfig = {
  key: string
  direction: "asc" | "desc"
}

// Tipo para filtros
type Filters = {
  [key: string]: string | string[]
}

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  searchPlaceholder?: string
}

export function DataTable<T>({ data, columns, searchPlaceholder = "Buscar..." }: DataTableProps<T>) {
  // Estado para dados filtrados
  const [filteredData, setFilteredData] = useState<T[]>(data)

  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" })

  // Estado para filtros
  const [filters, setFilters] = useState<Filters>({})

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
    const sortedData = [...filteredData].sort((a, b) => {
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

    setFilteredData(sortedData)
  }

  // Função para aplicar filtros
  const applyFilters = () => {
    let result = [...data]

    // Aplicar pesquisa global
    if (searchTerm) {
      result = result.filter((item) => {
        // Verificar em todas as propriedades do item
        return Object.keys(item).some((key) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = item[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase())
          }
          return false
        })
      })
    }

    // Aplicar filtros específicos
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key]
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        // Para filtros de array
        result = result.filter((item) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = item[key]
          if (Array.isArray(value)) {
            return value.some((v) => filterValue.includes(v))
          }
          return false
        })
      } else if (filterValue && typeof filterValue === "string" && filterValue !== "") {
        // Para filtros de string
        result = result.filter((item) => {
          // @ts-ignore - Ignorando erro de tipagem para acessar propriedades dinâmicas
          const value = item[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    })

    setFilteredData(result)
  }

  // Aplicar filtros quando mudam
  useState(() => {
    applyFilters()
  }, [filters, searchTerm])

  // Renderizar cabeçalho da tabela com ordenação
  const renderSortableHeader = (column: ColumnDef<T>) => {
    if (!column.enableSorting) {
      return <TableHead>{column.header}</TableHead>
    }

    return (
      <TableHead>
        <button className="flex items-center gap-1 hover:text-primary" onClick={() => requestSort(column.accessorKey)}>
          {column.header}
          {sortConfig.key === column.accessorKey ? (
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
  }

  // Obter colunas filtráveis
  const filterableColumns = columns.filter((column) => column.enableFiltering)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filterableColumns.length > 0 && (
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

                {filterableColumns.map((column) => (
                  <div key={column.accessorKey} className="space-y-2">
                    <h5 className="text-sm font-medium">{column.header}</h5>
                    <Command>
                      <CommandInput placeholder={`Buscar ${column.header.toLowerCase()}...`} />
                      <CommandList className="max-h-40 overflow-auto">
                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                        <CommandGroup>
                          {column.filterOptions?.map((option) => (
                            <CommandItem key={option}>
                              <Checkbox
                                id={`${column.accessorKey}-${option}`}
                                checked={
                                  filters[column.accessorKey] === option ||
                                  (Array.isArray(filters[column.accessorKey]) &&
                                    filters[column.accessorKey].includes(option))
                                }
                                onCheckedChange={(checked) => {
                                  setFilters({
                                    ...filters,
                                    [column.accessorKey]: checked ? option : "",
                                  })
                                }}
                              />
                              <label htmlFor={`${column.accessorKey}-${option}`} className="ml-2 text-sm">
                                {option}
                              </label>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({})
                      setSearchTerm("")
                      setFilteredData(data)
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
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>{columns.map((column) => renderSortableHeader(column))}</TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>{column.cell(item)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
