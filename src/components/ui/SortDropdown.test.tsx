import { fireEvent, render, screen } from '@testing-library/react'
import { SortDropdown } from './SortDropdown'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

describe('SortDropdown', () => {
  it('renders default options and reports the selected order', () => {
    const onChange = jest.fn()
    render(<SortDropdown value="desc" onChange={onChange} />)
    const select = screen.getByRole('combobox', { name: 'Ordenar por' })

    expect(screen.getByRole('option', { name: 'Mais recentes' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mais antigas' })).toBeInTheDocument()
    fireEvent.change(select, { target: { value: 'asc' } })
    expect(onChange).toHaveBeenCalledWith('asc')
  })

  it('supports scope-specific option labels', () => {
    render(
      <SortDropdown
        value="desc"
        onChange={jest.fn()}
        descendingLabel="Votos mais recentes"
        ascendingLabel="Votos mais antigos"
      />,
    )

    expect(
      screen.getByRole('option', { name: 'Votos mais recentes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Votos mais antigos' }),
    ).toBeInTheDocument()
  })
})
