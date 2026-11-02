import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { VotedPoll } from '../services/pollService'
import type { Poll } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useMyPolls } from '../hooks/useMyPolls'
import { useMyVotes } from '../hooks/useMyVotes'
import { usePolls } from '../hooks/usePolls'
import { PollsListPage, validatePollScopeSearch } from './index'

const routerMock = vi.hoisted(() => ({
  scope: 'all',
  user: { uid: 'user-1' } as { uid: string } | null,
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute:
    () =>
    (options: { component: () => ReactNode }) => ({
      ...options,
      useSearch: () => ({ scope: routerMock.scope }),
    }),
  useNavigate: () => (options: { search?: { scope?: string } }) => {
    routerMock.navigate(options)
    if (options.search?.scope) routerMock.scope = options.search.scope
  },
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string | Record<string, unknown>) =>
      typeof defaultValue === 'string' ? defaultValue : key,
  }),
}))

vi.mock('../components/AuthPrompt', () => ({
  AuthPrompt: ({ title }: { title: string }) => (
    <div data-testid="auth-prompt">{title}</div>
  ),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../hooks/usePolls', () => ({
  usePolls: vi.fn(),
}))

vi.mock('../hooks/useMyPolls', () => ({
  useMyPolls: vi.fn(),
}))

vi.mock('../hooks/useMyVotes', () => ({
  useMyVotes: vi.fn(),
}))

const polls: Poll[] = [
  {
    id: 'created-newer',
    title: 'Created newest',
    startDate: new Date('2026-01-01T10:00:00'),
    endDate: new Date('2026-01-10T18:00:00'),
    status: 'em andamento',
    options: [],
    createdBy: 'user-1',
    createdAt: new Date('2026-02-02T09:00:00'),
  },
  {
    id: 'created-older',
    title: 'Created older',
    startDate: new Date('2026-01-01T10:00:00'),
    endDate: new Date('2026-01-10T18:00:00'),
    status: 'em andamento',
    options: [],
    createdBy: 'user-1',
    createdAt: new Date('2026-02-01T09:00:00'),
  },
]

const votedPolls: VotedPoll[] = [
  {
    ...polls[0],
    id: 'voted-older',
    title: 'Voted older',
    votedAt: new Date('2026-02-01T09:00:00'),
  },
  {
    ...polls[1],
    id: 'voted-newer',
    title: 'Voted newest',
    votedAt: new Date('2026-02-02T09:00:00'),
  },
]

describe('PollsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routerMock.scope = 'all'
    routerMock.user = { uid: 'user-1' }
    vi.mocked(useAuth).mockReturnValue({
      user: routerMock.user as never,
      loading: false,
      loginWithGoogle: vi.fn(),
      loginAnon: vi.fn(),
      logout: vi.fn(),
    })
    vi.mocked(usePolls).mockReturnValue({
      polls,
      loading: false,
      error: null,
      refetch: vi.fn(),
      addPoll: vi.fn(),
    })
    vi.mocked(useMyPolls).mockReturnValue({
      polls,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    vi.mocked(useMyVotes).mockReturnValue({
      votedPolls,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('validates the default scope as all and renders the all-polls view', () => {
    expect(validatePollScopeSearch({})).toEqual({ scope: 'all' })
    expect(validatePollScopeSearch({ scope: 'invalid' })).toEqual({
      scope: 'all',
    })

    render(<PollsListPage />)

    expect(screen.getByRole('tab', { name: 'Todas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Created newest')).toBeInTheDocument()
  })

  it('updates the query scope when a signed-in user changes tabs', async () => {
    const user = userEvent.setup()
    const view = render(<PollsListPage />)

    await user.click(screen.getByRole('tab', { name: 'Criadas por mim' }))

    expect(routerMock.navigate).toHaveBeenCalledWith({
      search: { scope: 'mine' },
    })
    view.rerender(<PollsListPage />)
    expect(
      screen.getByRole('tab', { name: 'Criadas por mim' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it.each(['Criadas por mim', 'Votadas por mim'] as const)(
    'prompts for authentication instead of changing to %s when signed out',
    async (label) => {
      routerMock.user = null
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        loginWithGoogle: vi.fn(),
        loginAnon: vi.fn(),
        logout: vi.fn(),
      })
      const user = userEvent.setup()

      render(<PollsListPage />)
      await user.click(screen.getByRole('tab', { name: label }))

      expect(screen.getByTestId('auth-prompt')).toBeInTheDocument()
      expect(routerMock.navigate).not.toHaveBeenCalled()
      expect(routerMock.scope).toBe('all')
    },
  )

  it('sorts all and mine by creation date, and voted polls by vote date', async () => {
    const user = userEvent.setup()
    const view = render(<PollsListPage />)
    const getCardTitles = () =>
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

    expect(getCardTitles()).toEqual(['Created newest', 'Created older'])

    await user.click(screen.getByRole('tab', { name: 'Criadas por mim' }))
    view.rerender(<PollsListPage />)
    expect(getCardTitles()).toEqual(['Created newest', 'Created older'])

    await user.click(screen.getByRole('tab', { name: 'Votadas por mim' }))
    view.rerender(<PollsListPage />)
    expect(getCardTitles()).toEqual(['Voted newest', 'Voted older'])
  })

  it('changes the sort labels for vote dates in the voted scope', async () => {
    const user = userEvent.setup()
    const view = render(<PollsListPage />)

    await user.click(screen.getByRole('tab', { name: 'Votadas por mim' }))
    view.rerender(<PollsListPage />)

    expect(
      screen.getByRole('option', { name: 'Votos mais recentes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Votos mais antigos' }),
    ).toBeInTheDocument()
  })

  it('continues to combine title search with the status filter', async () => {
    vi.mocked(usePolls).mockReturnValue({
      polls: [
        {
          ...polls[0],
          title: 'Frontend framework recent',
          status: 'em andamento',
        },
        {
          ...polls[1],
          title: 'Frontend framework started',
          status: 'iniciado',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
      addPoll: vi.fn(),
    })
    const user = userEvent.setup()

    render(<PollsListPage />)
    await user.type(screen.getByRole('searchbox'), 'FRAMEWORK')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)

    await user.selectOptions(screen.getByLabelText('Status'), 'iniciado')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.getByText('Frontend framework started')).toBeInTheDocument()
  })

  it('keeps the ten-item page size and navigates to the next page', async () => {
    vi.mocked(usePolls).mockReturnValue({
      polls: Array.from({ length: 11 }, (_, index) => ({
        ...polls[0],
        id: `page-poll-${index}`,
        title: `Page poll ${index}`,
        createdAt: new Date(`2026-02-${String(index + 1).padStart(2, '0')}T09:00:00`),
      })),
      loading: false,
      error: null,
      refetch: vi.fn(),
      addPoll: vi.fn(),
    })
    const user = userEvent.setup()

    render(<PollsListPage />)

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10)
    await user.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.getByText('Page poll 0')).toBeInTheDocument()
  })
})
