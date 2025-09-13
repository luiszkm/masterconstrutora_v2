"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTablePaginationProps {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  totalItems,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100]
}: DataTablePaginationProps) {
  // Validações defensivas
  const safeTotalItems = Math.max(0, totalItems || 0)
  const safePageSize = Math.max(1, pageSize || 10)
  // Calcular totalPages baseado nos itens totais e tamanho da página
  const calculatedTotalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize))
  const safeTotalPages = Math.max(1, totalPages || calculatedTotalPages)
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages))

  // Debug removido - funcionalidade estável
  // Calcular itens sendo exibidos
  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems)

  // Gerar números de página para exibir
  const getPageNumbers = () => {
    const delta = 2
    const pages = []
    const rangeStart = Math.max(2, safeCurrentPage - delta)
    const rangeEnd = Math.min(safeTotalPages - 1, safeCurrentPage + delta)

    // Sempre mostrar primeira página
    if (safeTotalPages > 0) pages.push(1)

    // Adicionar ellipsis se necessário
    if (rangeStart > 2) pages.push('...')

    // Adicionar páginas do range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== safeTotalPages) {
        pages.push(i)
      }
    }

    // Adicionar ellipsis se necessário
    if (rangeEnd < safeTotalPages - 1) pages.push('...')

    // Sempre mostrar última página
    if (safeTotalPages > 1) pages.push(safeTotalPages)

    return pages
  }

  const pageNumbers = getPageNumbers()

  // Mostrar sempre, mesmo sem dados

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Informações dos itens */}
      <div className="flex-1 text-sm text-muted-foreground">
        {safeTotalItems === 0 ? (
          "Nenhum resultado encontrado"
        ) : (
          `Mostrando ${startItem} a ${endItem} de ${safeTotalItems} resultados`
        )}
      </div>

      {/* Controles centrais */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Seletor de itens por página */}
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Itens por página</p>
            <Select
              value={`${safePageSize}`}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={safePageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Controles de navegação */}
        <div className="flex items-center space-x-2">
          {/* Primeira página */}
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Números das páginas */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === '...' ? (
                <div
                  key={`ellipsis-${safeCurrentPage}-${safeTotalPages}-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-sm"
                >
                  ...
                </div>
              ) : (
                <Button
                  key={`page-${pageNumber}`}
                  variant={safeCurrentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(pageNumber as number)}
                >
                  {pageNumber}
                </Button>
              )
            ))}
          </div>

          {/* Próxima página */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === safeTotalPages}
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safeCurrentPage === safeTotalPages}
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Informação da página atual (mobile) */}
      <div className="flex items-center text-sm font-medium sm:hidden">
        Página {safeCurrentPage} de {safeTotalPages}
      </div>
    </div>
  )
}