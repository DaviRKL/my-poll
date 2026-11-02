import { fireEvent, render, screen } from '@testing-library/react'
import { Pagination } from './Pagination'

vi.mock('react-i18next', () => ({
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
    const onPageChange = vi.fn()
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
    const onPageChange = vi.fn()
    const { rerender } = render(
      <Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />,
    )

    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled()

    rerender(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />,
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
