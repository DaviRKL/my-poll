import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { RootComponent } from './__root'

const mockAuthState = {
  user: null as { uid: string; displayName: string; email: string; isAnonymous: boolean } | null,
  logout: jest.fn(),
}
const mockI18n = {
  language: 'pt-BR',
  changeLanguage: jest.fn(),
}
let mockCurrentPath = '/'

jest.mock('@tanstack/react-router', () => ({
  createRootRoute: (options: unknown) => options,
  Link: ({
    children,
    to,
    onClick,
    activeProps,
    inactiveProps,
  }: {
    children: ReactNode
    to: string
    onClick?: () => void
    activeProps?: { className?: string }
    inactiveProps?: { className?: string }
  }) => (
    <a
      href={to}
      onClick={onClick}
      className={
        mockCurrentPath === to
          ? activeProps?.className
          : inactiveProps?.className
      }
    >
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="route-outlet" />,
}))

jest.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
  }),
}))

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(() => mockAuthState),
}))

describe('RootComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthState.user = null
    mockI18n.language = 'pt-BR'
    mockCurrentPath = '/'
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders the header, primary navigation, theme control, and language selector', () => {
    render(<RootComponent />)

    expect(screen.getByRole('link', { name: 'My Poll' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Criar enquete' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enquetes' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mudar para o modo escuro' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Selecionar idioma' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('route-outlet')).toBeInTheDocument()
  })

  it('opens the mobile menu and closes it after selecting a route', () => {
    render(<RootComponent />)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const closeMenu = screen.getByRole('button', { name: 'Fechar menu' })
    expect(closeMenu).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getAllByRole('link', { name: 'Criar enquete' })[1])
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('renders account details and logs out an authenticated user', () => {
    mockAuthState.user = {
      uid: 'user-1',
      displayName: 'Poll Owner',
      email: 'poll@example.com',
      isAnonymous: false,
    }

    render(<RootComponent />)

    expect(screen.getByText('Poll Owner')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }))
    expect(mockAuthState.logout).toHaveBeenCalledTimes(1)
  })

  it('shows the anonymous account label when an anonymous user opens the mobile menu', () => {
    mockAuthState.user = {
      uid: 'anonymous-user',
      displayName: '',
      email: '',
      isAnonymous: true,
    }

    render(<RootComponent />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

    expect(screen.getAllByText('Anônimo')).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sair da conta' })[1])
    expect(mockAuthState.logout).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('uses the account email and anonymous fallback when no display name exists', () => {
    mockAuthState.user = {
      uid: 'email-user',
      displayName: '',
      email: 'poll@example.com',
      isAnonymous: false,
    }

    const view = render(<RootComponent />)
    expect(screen.getByText('poll@example.com')).toBeInTheDocument()

    mockAuthState.user.email = ''
    view.rerender(<RootComponent />)
    expect(screen.getByText('Anônimo')).toBeInTheDocument()
  })

  it('applies active and inactive navigation styles for the current route', () => {
    const view = render(<RootComponent />)
    expect(screen.getByRole('link', { name: 'Enquetes' })).toHaveClass(
      'font-semibold',
    )
    expect(screen.getByRole('link', { name: 'Criar enquete' })).toHaveClass(
      'text-neutral-500',
    )

    mockCurrentPath = '/create'
    view.rerender(<RootComponent />)
    expect(screen.getByRole('link', { name: 'Criar enquete' })).toHaveClass(
      'font-semibold',
    )
    expect(screen.getByRole('link', { name: 'Enquetes' })).toHaveClass(
      'text-neutral-500',
    )
  })
})
