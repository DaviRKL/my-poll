import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPrompt } from './AuthPrompt'
import { useAuth } from '../hooks/useAuth'

// Mock do hook useAuth
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

// Mock do hook react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const dictionary: Record<string, string> = {
        'auth.title': 'Inicie sessão para continuar',
        'auth.description':
          'É necessário identificar-se para poder criar enquetes e registrar votos em tempo real.',
        'auth.google': 'Entrar com Google',
        'auth.anonymous': 'Continuar anonimamente',
        'auth.connecting': 'A conectar...',
        'auth.entering': 'A entrar...',
        'auth.googleError': 'Falha ao autenticar com Google. Tente novamente.',
        'auth.anonError': 'Falha ao entrar anonimamente. Tente novamente.',
      }
      return dictionary[key] || defaultValue || key
    },
  }),
}))

describe('AuthPrompt Component', () => {
  const mockLoginWithGoogle = jest.fn()
  const mockLoginAnon = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginAnon: mockLoginAnon,
      logout: jest.fn(),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renderiza o título e a descrição padrão', () => {
    render(<AuthPrompt />)

    expect(
      screen.getByRole('heading', { name: /inicie sessão para continuar/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /é necessário identificar-se para poder criar enquetes e registrar votos/i,
      ),
    ).toBeInTheDocument()
  })

  it('permite customizar o título e a descrição através das props', () => {
    const { container } = render(
      <AuthPrompt
        title="Acesso Restrito"
        description="Por favor faça login para visualizar os resultados"
        className="custom-auth-prompt"
      />,
    )

    expect(container.firstChild).toHaveClass('custom-auth-prompt')
    expect(screen.getByRole('heading', { name: 'Acesso Restrito' })).toBeInTheDocument()
    expect(
      screen.getByText('Por favor faça login para visualizar os resultados'),
    ).toBeInTheDocument()
  })

  it('renderiza os botões "Entrar com Google" e "Continuar anonimamente"', () => {
    render(<AuthPrompt />)

    expect(
      screen.getByRole('button', { name: /entrar com google/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continuar anonimamente/i }),
    ).toBeInTheDocument()
  })

  it('chama a função loginWithGoogle ao clicar no botão "Entrar com Google"', async () => {
    const user = userEvent.setup()
    mockLoginWithGoogle.mockResolvedValueOnce(undefined)

    render(<AuthPrompt />)
    const googleButton = screen.getByRole('button', { name: /entrar com google/i })

    await user.click(googleButton)
    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('chama a função loginAnon ao clicar no botão "Continuar anonimamente"', async () => {
    const user = userEvent.setup()
    mockLoginAnon.mockResolvedValueOnce(undefined)

    render(<AuthPrompt />)
    const anonButton = screen.getByRole('button', { name: /continuar anonimamente/i })

    await user.click(anonButton)
    expect(mockLoginAnon).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['google', 'Falha ao autenticar com Google. Tente novamente.'],
    ['anon', 'Falha ao entrar anonimamente. Tente novamente.'],
  ] as const)(
    'exibe uma mensagem de erro quando o login %s falha',
    async (method, errorMessage) => {
      const login = method === 'google' ? mockLoginWithGoogle : mockLoginAnon
      login.mockRejectedValueOnce(new Error('Authentication failed'))
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()

      render(<AuthPrompt />)
      await user.click(
        screen.getByRole('button', {
          name: method === 'google' ? /entrar com google/i : /continuar anonimamente/i,
        }),
      )

      expect(await screen.findByText(errorMessage)).toBeInTheDocument()
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: method === 'google' ? /entrar com google/i : /continuar anonimamente/i,
          }),
        ).toBeEnabled()
      })
      expect(login).toHaveBeenCalledTimes(1)
      expect(consoleError).toHaveBeenCalled()
    },
  )

  it('indicates an in-progress Google login and disables both login actions', async () => {
    let resolveLogin: (() => void) | undefined
    mockLoginWithGoogle.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve
      }),
    )
    const user = userEvent.setup()

    render(<AuthPrompt />)
    await user.click(screen.getByRole('button', { name: /entrar com google/i }))

    expect(screen.getByRole('button', { name: 'A conectar...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /continuar anonimamente/i })).toBeDisabled()

    resolveLogin?.()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /entrar com google/i })).toBeEnabled(),
    )
  })
})
