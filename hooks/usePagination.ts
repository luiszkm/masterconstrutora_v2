import { useState, useCallback } from "react"

interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  totalPages: number
  onLoad: (page: number, pageSize: number) => void
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalPages,
  onLoad,
}: PaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
        onLoad(newPage, pageSize)
      }
    },
    [totalPages, onLoad, pageSize]
  )

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize)
      setCurrentPage(1)
      onLoad(1, newSize) // sempre volta pra primeira página
    },
    [onLoad]
  )

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  }
}
