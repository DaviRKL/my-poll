import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PollsListPage } from '../pages/PollsListPage'
import { usePolls } from '../hooks/usePolls'
import type { Poll } from '../types'

// Mock de @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({
    children,
    to,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string | Record<string, unknown>) => {
      const dictionary: Record<string, string> = {
        'home.title': 'Enquetes',
        'home.subtitle': 'Encontre aqui a sua enquete',
        'home.statusLabel': 'Status',
        'home.statusAll': 'Todas',
        'home.statusNotStarted': 'Não iniciado',
        'home.statusInProgress': 'Em andamento',
        'home.statusFinished': 'Finalizado',
        'home.emptyTitle': 'Nenhuma enquete encontrada.',
        'home.emptyGeneral': 'Seja o primeiro a publicar uma nova enquete em tempo real!',
        'home.createButton': 'Criar enquete agora',
        'home.startDatePrefix': 'Inicio: ',
        'home.endDatePrefix': 'Término: ',
        'common.loadingPolls': 'Carregando enquetes...',
        'common.tryAgain': 'Tentar novamente',
      }
      if (typeof defaultValue === 'string') return dictionary[key] || defaultValue
      return dictionary[key] || key
    },
  }),
}))

// Mock do hook usePolls
vi.mock('../hooks/usePolls', () => ({
  usePolls: vi.fn(),
}))

describe('PollsListPage', () => {
  const mockRefetch = vi.fn()

  const mockPollsList: Poll[] = [
    {
      id: 'poll-1',
      title: 'Qual o melhor framework frontend?',
      startDate: new Date('2026-01-01T10:00:00'),
      endDate: new Date('2026-01-10T18:00:00'),
      status: 'em andamento',
      options: [
        { id: '1', text: 'React', votes: 15 },
        { id: '2', text: 'Angular', votes: 5 },
        { id: '3', text: 'Vue', votes: 11 },
      ],
      createdBy: 'user-123',
      createdAt: new Date('2026-01-01T09:00:00'),
    },
    {
      id: 'poll-2',
      title: 'Qual a melhor linguagem do momento?',
      startDate: new Date('2026-02-01T10:00:00'),
      endDate: new Date('2026-02-15T18:00:00'),
      status: 'em andamento',
      options: [
        { id: '1', text: 'TypeScript', votes: 20 },
        { id: '2', text: 'Python', votes: 10 },
        { id: '3', text: 'Rust', votes: 8 },
      ],
      createdBy: 'user-456',
      createdAt: new Date('2026-02-01T09:00:00'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePolls).mockReturnValue({
      polls: mockPollsList,
      loading: false,
      error: null,
      refetch: mockRefetch,
      addPoll: vi.fn(),
    })
  })

  it('renderiza o cabeçalho e o subtítulo da página de enquetes', () => {
    render(<PollsListPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Enquetes' })).toBeInTheDocument()
    expect(screen.getByText('Encontre aqui a sua enquete')).toBeInTheDocument()
  })

  it('renderiza o filtro de status com o valor padrão "Todas" e as opções esperadas', () => {
    render(<PollsListPage />)

    const select = screen.getByLabelText(/status/i) as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select.value).toBe('')

    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Não iniciado' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Em andamento' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Finalizado' })).toBeInTheDocument()
  })

  it('renderiza os títulos das enquetes simuladas pelo hook usePolls', () => {
    render(<PollsListPage />)

    expect(
      screen.getByText('Qual o melhor framework frontend?'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Qual a melhor linguagem do momento?'),
    ).toBeInTheDocument()
  })

  it('permite ao utilizador alterar a opção selecionada no filtro de status', async () => {
    const user = userEvent.setup()
    render(<PollsListPage />)

    const select = screen.getByLabelText(/status/i) as HTMLSelectElement
    await user.selectOptions(select, 'finalizado')

    expect(select.value).toBe('finalizado')
  })

  it('exibe mensagem de carregando quando loading for verdadeiro', () => {
    vi.mocked(usePolls).mockReturnValue({
      polls: [],
      loading: true,
      error: null,
      refetch: mockRefetch,
      addPoll: vi.fn(),
    })

    render(<PollsListPage />)
    expect(screen.getByText('Carregando enquetes...')).toBeInTheDocument()
  })

  it('exibe a mensagem de nenhuma enquete encontrada quando o array de enquetes estiver vazio', () => {
    vi.mocked(usePolls).mockReturnValue({
      polls: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
      addPoll: vi.fn(),
    })

    render(<PollsListPage />)
    expect(screen.getByText('Nenhuma enquete encontrada.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /criar enquete agora/i }),
    ).toBeInTheDocument()
  })
})
