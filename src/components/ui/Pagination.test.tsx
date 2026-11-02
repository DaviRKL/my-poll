import { fireEvent, render, screen } from '@testing-library/react'
import { Pagination } from './Pagination'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: { current?: number; total?: number; page?: number; defaultValue?: string },
    ) => {
      if (key === 'pagination.previous') return 'Anterior'
      if (key === 'pagination.next') return 'Próximo'
      if (key === 'pagination.pageOf') {
        return `Página ${options?.current} de ${options?.total}`
      }
      if (key === 'pagination.pageNumber') return `Página ${options?.page}`
      return options?.defaultValue ?? key
    },
  }),
}))

describe('Pagination', () => {
  it('disables previous on the first page and advances when next is clicked', () => {
    const onPageChange = jest.fn()
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />,
    )

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables next on the last page and hides itself when there is one page', () => {
    const onPageChange = jest.fn()
    const { rerender } = render(
      <Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />,
    )

    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled()

    rerender(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />,
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders all page numbers when there are seven pages or fewer', () => {
    const onPageChange = jest.fn()
    render(
      <Pagination currentPage={4} totalPages={7} onPageChange={onPageChange} />,
    )

    expect(screen.getAllByRole('button', { name: /^Página \d+$/ })).toHaveLength(7)
    fireEvent.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it.each([
    [2, ['Página 1', 'Página 2', 'Página 3', 'Página 4', 'Página 5', 'Página 10']],
    [5, ['Página 1', 'Página 4', 'Página 5', 'Página 6', 'Página 10']],
    [9, ['Página 1', 'Página 6', 'Página 7', 'Página 8', 'Página 9', 'Página 10']],
  ])('shows the appropriate page window at page %i', (currentPage, expectedPages) => {
    render(
      <Pagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={jest.fn()}
      />,
    )

    for (const page of expectedPages) {
      expect(screen.getByRole('button', { name: page })).toBeInTheDocument()
    }
    expect(screen.getAllByText('…')).toHaveLength(currentPage === 5 ? 2 : 1)
  })
})
