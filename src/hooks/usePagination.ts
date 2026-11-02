import { useCallback, useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize = 10) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('pageSize must be a positive integer.')
  }

  const [requestedPage, setRequestedPage] = useState(1)
  const totalPages = Math.ceil(items.length / pageSize)
  const lastAvailablePage = Math.max(totalPages, 1)
  const currentPage = Math.min(requestedPage, lastAvailablePage)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return items.slice(startIndex, currentPage * pageSize)
  }, [items, currentPage, pageSize])

  const goToPage = useCallback(
    (page: number) => {
      if (!Number.isFinite(page)) return
      setRequestedPage(Math.min(Math.max(Math.trunc(page), 1), lastAvailablePage))
    },
    [lastAvailablePage],
  )

  const resetPage = useCallback(() => setRequestedPage(1), [])

  return {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    resetPage,
  }
}
