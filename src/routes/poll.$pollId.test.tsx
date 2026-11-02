import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Poll } from '../types'
import { useAuth } from '../hooks/useAuth'
import { usePoll } from '../hooks/usePoll'
import { PollDetailsPage } from './poll.$pollId'

const mockNavigate = jest.fn()
const mockPoll: Poll = {
  id: 'poll-1',
  title: 'Favorite framework?',
  startDate: new Date('2030-01-01T10:00:00'),
  endDate: new Date('2030-01-02T10:00:00'),
  status: 'iniciado',
  options: [
    { id: 'react', text: 'React', votes: 3 },
    { id: 'vue', text: 'Vue', votes: 1 },
  ],
  createdBy: 'owner-1',
  createdAt: new Date('2029-12-01T10:00:00'),
}
const mockPollState = {
  poll: mockPoll as Poll | null,
  loading: false,
  error: null as Error | null,
  hasVoted: false,
  handleVote: jest.fn(),
  changeStatus: jest.fn(),
  isOwner: false,
  isVotingActive: true,
}

jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => () => ({ useParams: () => ({ pollId: 'poll-1' }) }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, value?: string | { defaultValue?: string }) =>
      typeof value === 'string' ? value : value?.defaultValue ?? _key,
  }),
}))

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../hooks/usePoll', () => ({
  usePoll: jest.fn(() => mockPollState),
}))

describe('PollDetailsPage', () => {
  const submitVoteForm = () => {
    const form = document.querySelector('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.assign(mockPollState, {
      poll: mockPoll,
      loading: false,
      error: null,
      hasVoted: false,
      isOwner: false,
      isVotingActive: true,
    })
    jest.mocked(useAuth).mockReturnValue({
      user: { uid: 'voter-1' } as never,
      loading: false,
      loginWithGoogle: jest.fn(),
      loginAnon: jest.fn(),
      logout: jest.fn(),
    })
    jest.mocked(usePoll).mockReturnValue(mockPollState as never)
  })

  it.each(['iniciado', 'em andamento'] as const)(
    'allows selecting an option when the poll is %s',
    (status) => {
      mockPollState.poll = { ...mockPoll, status }
      mockPollState.isVotingActive = true

      render(<PollDetailsPage />)

      expect(screen.getByRole('radio', { name: 'React' })).toBeEnabled()
      expect(screen.getByRole('radio', { name: 'Vue' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Votar' })).toBeDisabled()
    },
  )

  it('disables vote options and the vote action for an inactive poll', () => {
    mockPollState.poll = { ...mockPoll, status: 'não iniciado' }
    mockPollState.isVotingActive = false

    render(<PollDetailsPage />)

    expect(screen.getByRole('radio', { name: 'React' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Vue' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Votar' })).toBeDisabled()
  })

  it('shows result bars when the current user has already voted', () => {
    mockPollState.hasVoted = true

    render(<PollDetailsPage />)

    expect(
      screen.getByRole('progressbar', { name: 'React: 3 votos (75%)' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Vue: 1 voto (25%)' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Total de votos registrados:')).toHaveTextContent(
      '4',
    )
  })

  it('shows status controls to the poll creator and persists a selected status', async () => {
    const user = userEvent.setup()
    mockPollState.isOwner = true
    mockPollState.changeStatus.mockResolvedValue(undefined)

    render(<PollDetailsPage />)
    const status = screen.getByRole('combobox', { name: 'Alterar status' })
    expect(status).toBeInTheDocument()

    await user.selectOptions(status, 'finalizado')

    await waitFor(() =>
      expect(mockPollState.changeStatus).toHaveBeenCalledWith('finalizado'),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Status alterado com sucesso',
    )
  })

  it('hides the owner-only status control from other users', () => {
    render(<PollDetailsPage />)
    expect(
      screen.queryByRole('combobox', { name: 'Alterar status' }),
    ).not.toBeInTheDocument()
  })

  it('renders loading, load-error, and not-found states', () => {
    mockPollState.loading = true
    const view = render(<PollDetailsPage />)
    expect(screen.getByText('Carregando enquete...')).toBeInTheDocument()

    mockPollState.loading = false
    mockPollState.error = new Error('Unable to load poll')
    view.rerender(<PollDetailsPage />)
    expect(screen.getByText('Unable to load poll')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute(
      'href',
      '/',
    )

    mockPollState.error = null
    mockPollState.poll = null
    view.rerender(<PollDetailsPage />)
    expect(screen.getByRole('heading', { name: 'Enquete não encontrada' })).toBeInTheDocument()
  })

  it('asks signed-out visitors to authenticate before voting', () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle: jest.fn(),
      loginAnon: jest.fn(),
      logout: jest.fn(),
    })

    render(<PollDetailsPage />)

    expect(screen.getByRole('heading', { name: 'Votar em "Favorite framework?"' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Votar' })).not.toBeInTheDocument()
  })

  it('validates a missing or stale option before calling the vote handler', () => {
    const view = render(<PollDetailsPage />)
    submitVoteForm()
    expect(screen.getByText('Por favor, selecione uma opção antes de votar.')).toBeInTheDocument()
    expect(mockPollState.handleVote).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('radio', { name: 'React' }))
    mockPollState.poll = { ...mockPoll, options: [] }
    view.rerender(<PollDetailsPage />)
    submitVoteForm()
    expect(screen.getByText('Opção inválida selecionada.')).toBeInTheDocument()
    expect(mockPollState.handleVote).not.toHaveBeenCalled()
  })

  it('submits a selected vote and shows the generic error when voting fails unexpectedly', async () => {
    const user = userEvent.setup()
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    mockPollState.handleVote.mockRejectedValueOnce('unknown failure')
    render(<PollDetailsPage />)
    await user.click(screen.getByRole('radio', { name: 'Vue' }))
    await user.click(screen.getByRole('button', { name: 'Votar' }))

    expect(await screen.findByText('Ocorreu um erro ao registrar seu voto.')).toBeInTheDocument()
    expect(mockPollState.handleVote).toHaveBeenCalledWith('vue')
    expect(consoleError).toHaveBeenCalled()
  })

  it('shows the specific error when the vote handler rejects with an Error', async () => {
    const user = userEvent.setup()
    jest.spyOn(console, 'error').mockImplementation()
    mockPollState.handleVote.mockRejectedValueOnce(new Error('Vote is closed'))
    render(<PollDetailsPage />)
    await user.click(screen.getByRole('radio', { name: 'React' }))
    await user.click(screen.getByRole('button', { name: 'Votar' }))

    expect(await screen.findByText('Vote is closed')).toBeInTheDocument()
  })

  it('shows specific and generic errors when status changes fail', async () => {
    const user = userEvent.setup()
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    mockPollState.isOwner = true
    mockPollState.changeStatus.mockRejectedValueOnce(new Error('Status denied'))
    render(<PollDetailsPage />)
    const selector = screen.getByRole('combobox', { name: 'Alterar status' })

    await user.selectOptions(selector, 'finalizado')
    expect(await screen.findByRole('alert')).toHaveTextContent('Status denied')

    mockPollState.changeStatus.mockRejectedValueOnce('unexpected')
    await user.selectOptions(selector, 'em andamento')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível alterar o status.',
    )
    expect(consoleError).toHaveBeenCalledTimes(2)
  })

  it('returns from manual results to voting and navigates home after a recorded vote', async () => {
    const user = userEvent.setup()
    const view = render(<PollDetailsPage />)

    await user.click(screen.getByRole('button', { name: 'Resultados' }))
    expect(screen.getByText('Total de votos registrados:')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByRole('button', { name: 'Votar' })).toBeInTheDocument()

    mockPollState.hasVoted = true
    view.rerender(<PollDetailsPage />)
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('shows closed state for a finished poll and zero percentages for empty results', () => {
    mockPollState.poll = {
      ...mockPoll,
      status: 'finalizado',
      options: [
        { id: 'zero', text: 'No votes', votes: 0 },
      ],
    }
    mockPollState.isVotingActive = false

    const view = render(<PollDetailsPage />)
    expect(screen.getByText('Votação fechada (encerrada)')).toBeInTheDocument()

    mockPollState.hasVoted = true
    view.rerender(<PollDetailsPage />)
    expect(
      screen.getByRole('progressbar', { name: 'No votes: 0 votos (0%)' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Total de votos registrados:')).toHaveTextContent('0')
  })

  it('shows the scheduled start date when voting has not started yet', () => {
    mockPollState.poll = { ...mockPoll, status: 'não iniciado' }
    mockPollState.isVotingActive = false

    render(<PollDetailsPage />)

    expect(screen.getByText(/Votação fechada \(inicia em/)).toBeInTheDocument()
  })
})
