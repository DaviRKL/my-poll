import { fireEvent, render, screen } from '@testing-library/react'
import { SearchBar } from './SearchBar'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue,
  }),
}))

describe('SearchBar', () => {
  it('renders the accessible search field and reports typed values', () => {
    const onChange = jest.fn()
    render(<SearchBar value="" onChange={onChange} />)
    const search = screen.getByRole('searchbox', {
      name: 'Pesquisar enquete...',
    })

    fireEvent.change(search, { target: { value: 'React' } })

    expect(onChange).toHaveBeenCalledWith('React')
    expect(search).toHaveAttribute('placeholder', 'Pesquisar enquete...')
  })
})
