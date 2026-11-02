import { fireEvent, render, screen } from '@testing-library/react'
import { LanguageSwitcher } from './LanguageSwitcher'

let mockLanguage = 'pt-BR'
let mockResolvedLanguage: string | undefined
const mockChangeLanguage = jest.fn()

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      get resolvedLanguage() {
        return mockResolvedLanguage
      },
      get language() {
        return mockLanguage
      },
      changeLanguage: mockChangeLanguage,
    },
    t: (_key: string, defaultValue?: string) => defaultValue,
  }),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockLanguage = 'pt-BR'
    mockResolvedLanguage = undefined
    document.documentElement.lang = ''
    jest.clearAllMocks()
  })

  it('marks Portuguese as selected and changes the document language to English', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: 'PT' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    fireEvent.click(screen.getByRole('button', { name: 'EN' }))

    expect(mockChangeLanguage).toHaveBeenCalledWith('en-US')
    expect(document.documentElement.lang).toBe('en-US')
  })

  it('changes the document language to Portuguese', () => {
    mockLanguage = 'en-US'
    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByRole('button', { name: 'PT' }))

    expect(mockChangeLanguage).toHaveBeenCalledWith('pt-BR')
    expect(document.documentElement.lang).toBe('pt-BR')
  })

  it('uses the resolved language and falls back to Portuguese when no language is set', () => {
    mockResolvedLanguage = 'en-US'
    const { rerender } = render(<LanguageSwitcher />)
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    mockResolvedLanguage = undefined
    mockLanguage = ''
    rerender(<LanguageSwitcher />)
    expect(screen.getByRole('button', { name: 'PT' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
