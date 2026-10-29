import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPrompt } from './AuthPrompt'
import { useAuth } from '../hooks/useAuth'

// Mock do hook useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock do hook react-i18next
vi.mock('react-i18next', () => ({
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
  const mockLoginWithGoogle = vi.fn()
  const mockLoginAnon = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginAnon: mockLoginAnon,
      logout: vi.fn(),
    })
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
    render(
      <AuthPrompt
        title="Acesso Restrito"
        description="Por favor faça login para visualizar os resultados"
      />,
    )

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
})
