import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../hooks/useAuth'
import { createPoll } from '../services/pollService'
import { CreatePollPage } from './create'

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: unknown) => options,
  useNavigate: () => mockNavigate,
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

jest.mock('../services/pollService', () => ({
  createPoll: jest.fn(),
}))

jest.mock('../components/AuthPrompt', () => ({
  AuthPrompt: ({ title }: { title: string }) => (
    <div data-testid="auth-prompt">{title}</div>
  ),
}))

describe('CreatePollPage', () => {
  const fillValidPollForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText('Titulo'), 'My poll question')
    await user.type(screen.getByPlaceholderText('Opção 1'), 'Alpha')
    await user.type(screen.getByPlaceholderText('Opção 2'), 'Beta')
    await user.type(screen.getByPlaceholderText('Opção 3'), 'Gamma')
    fireEvent.change(screen.getByLabelText('Data de início'), {
      target: { value: '2030-01-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText('Data de término'), {
      target: { value: '2030-01-02T10:00' },
    })
  }

  const submitForm = () => {
    const form = document.querySelector('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAuth).mockReturnValue({
      user: { uid: 'user-123' } as never,
      loading: false,
      loginWithGoogle: jest.fn(),
      loginAnon: jest.fn(),
      logout: jest.fn(),
    })
    jest.mocked(createPoll).mockResolvedValue('new-poll')
  })

  it('renders the poll form for an authenticated user', () => {
    render(<CreatePollPage />)

    expect(
      screen.getByRole('heading', { name: 'Criar enquete' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Titulo')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de início')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de término')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Opção 3')).toBeRequired()
  })

  it('adds and removes options without allowing fewer than three', async () => {
    const user = userEvent.setup()
    render(<CreatePollPage />)

    await user.click(screen.getByRole('button', { name: 'Adicionar opção' }))
    expect(screen.getByPlaceholderText('Opção 4')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Remover opção' })[0])
    expect(screen.queryByPlaceholderText('Opção 4')).not.toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(/Opção \d/)).toHaveLength(3)
    expect(
      screen.queryByRole('button', { name: 'Remover opção' }),
    ).not.toBeInTheDocument()
  })

  it('creates a poll with the authenticated creator and navigates to the list', async () => {
    const user = userEvent.setup()
    render(<CreatePollPage />)

    await fillValidPollForm(user)
    await user.click(screen.getByRole('button', { name: 'Criar enquete' }))

    await waitFor(() => expect(createPoll).toHaveBeenCalledTimes(1))
    expect(createPoll).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My poll question',
        createdBy: 'user-123',
        options: [
          expect.objectContaining({ text: 'Alpha', votes: 0 }),
          expect.objectContaining({ text: 'Beta', votes: 0 }),
          expect.objectContaining({ text: 'Gamma', votes: 0 }),
        ],
      }),
    )
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('shows the authentication prompt when the user is signed out', () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle: jest.fn(),
      loginAnon: jest.fn(),
      logout: jest.fn(),
    })

    render(<CreatePollPage />)

    expect(screen.getByTestId('auth-prompt')).toHaveTextContent(
      'Inicie sessão para criar uma enquete',
    )
    expect(screen.queryByLabelText('Titulo')).not.toBeInTheDocument()
  })

  it.each([
    ['title', 'Por favor, informe o título da enquete.'],
    ['options', 'A enquete deve ter no mínimo 3 opções de resposta preenchidas (RN5).'],
    ['dates', 'Por favor, selecione datas de início e término válidas.'],
    ['date-order', 'A data de término deve ser posterior à data de início.'],
  ])('validates %s before creating a poll', async (invalidField, message) => {
    const user = userEvent.setup()
    render(<CreatePollPage />)

    if (invalidField !== 'title') {
      await user.type(screen.getByLabelText('Titulo'), 'Poll title')
    }
    if (invalidField === 'dates' || invalidField === 'date-order') {
      await user.type(screen.getByPlaceholderText('Opção 1'), 'Alpha')
      await user.type(screen.getByPlaceholderText('Opção 2'), 'Beta')
      await user.type(screen.getByPlaceholderText('Opção 3'), 'Gamma')
      fireEvent.change(screen.getByLabelText('Data de início'), {
        target: { value: '2030-01-01T10:00' },
      })
      fireEvent.change(screen.getByLabelText('Data de término'), {
        target: {
          value: invalidField === 'dates' ? '' : '2030-01-01T10:00',
        },
      })
    } else if (invalidField === 'options') {
      await user.type(screen.getByPlaceholderText('Opção 1'), 'Alpha')
      await user.type(screen.getByPlaceholderText('Opção 2'), 'Beta')
    }

    submitForm()

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(createPoll).not.toHaveBeenCalled()
  })

  it.each([
    [new Error('Firestore unavailable'), 'Firestore unavailable'],
    ['unknown failure', 'Ocorreu um erro ao criar a enquete. Tente novamente.'],
  ])('shows a useful error when poll creation fails', async (failure, message) => {
    const user = userEvent.setup()
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    jest.mocked(createPoll).mockRejectedValueOnce(failure)
    render(<CreatePollPage />)
    await fillValidPollForm(user)
    submitForm()

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar enquete' })).toBeEnabled()
    consoleError.mockRestore()
  })

})
