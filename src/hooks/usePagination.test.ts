import { act, renderHook } from '@testing-library/react'
import { usePagination } from './usePagination'

describe('usePagination', () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1)

  it('slices items based on the current page and page size', () => {
    const { result } = renderHook(() => usePagination(items))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.paginatedItems).toEqual(items.slice(0, 10))

    act(() => result.current.goToPage(2))

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedItems).toEqual(items.slice(10, 20))
  })

  it('resets to page one and clamps the visible page when item count shrinks', () => {
    const { result, rerender } = renderHook(
      ({ values }) => usePagination(values, 10),
      { initialProps: { values: items } },
    )

    act(() => result.current.goToPage(3))
    expect(result.current.currentPage).toBe(3)

    rerender({ values: items.slice(0, 12) })
    expect(result.current.currentPage).toBe(2)

    act(() => result.current.resetPage())
    expect(result.current.currentPage).toBe(1)
  })

  it('clamps requested pages to valid bounds', () => {
    const { result } = renderHook(() => usePagination(items))

    act(() => result.current.goToPage(10))
    expect(result.current.currentPage).toBe(3)

    act(() => result.current.goToPage(0))
    expect(result.current.currentPage).toBe(1)
  })
})
