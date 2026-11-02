import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    jest.restoreAllMocks()
  })

  it('inicia no modo claro por padrão quando não há preferência salva', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /mudar para o modo escuro/i })
    expect(button).toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('adiciona a classe "dark" ao elemento <html> e atualiza o aria-label ao alternar para modo escuro', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /mudar para o modo escuro/i })

    // Clica para ativar o modo escuro
    await user.click(button)

    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /mudar para o modo claro/i })).toBeInTheDocument()
  })

  it('remove a classe "dark" do elemento <html> ao clicar novamente para voltar ao modo claro', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /mudar para o modo escuro/i })

    // Alterna para escuro
    await user.click(button)
    expect(document.documentElement).toHaveClass('dark')

    // Alterna de volta para claro
    await user.click(button)
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(screen.getByRole('button', { name: /mudar para o modo escuro/i })).toBeInTheDocument()
  })

  it('respeita a preferência "dark" pré-existente no localStorage', () => {
    localStorage.setItem('theme', 'dark')

    render(<ThemeToggle />)

    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: /mudar para o modo claro/i })).toBeInTheDocument()
  })

  it('uses the system dark-mode preference when there is no saved preference', () => {
    jest.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as unknown as MediaQueryList)

    render(<ThemeToggle />)

    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: /mudar para o modo claro/i })).toBeInTheDocument()
  })

  it('synchronizes later system preference changes until a preference is saved', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue(null)
    jest.spyOn(window.localStorage, 'setItem').mockImplementation()
    jest.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        if (typeof listener === 'function') {
          changeHandler = listener as (event: MediaQueryListEvent) => void
        }
      },
      removeEventListener: jest.fn(),
    } as unknown as MediaQueryList)

    render(<ThemeToggle />)

    expect(changeHandler).toBeDefined()
    act(() => changeHandler?.({ matches: true } as MediaQueryListEvent))
    expect(document.documentElement).toHaveClass('dark')
    act(() => changeHandler?.({ matches: false } as MediaQueryListEvent))
    expect(document.documentElement).not.toHaveClass('dark')
  })

})
