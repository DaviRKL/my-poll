import { useState, useEffect } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { user, logout } = useAuth()

  // Gerenciamento do Tema Claro / Escuro
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Header Superior */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700/60 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo "My Poll" à esquerda */}
          <Link
            to="/"
            className="text-2xl font-black tracking-tight text-primary-500 hover:text-primary-400 transition-colors select-none"
          >
            My Poll
          </Link>

          {/* Área de Navegação e Controles à direita */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm">
              <Link
                to="/create"
                activeProps={{
                  className:
                    'font-semibold text-neutral-900 dark:text-white border-b-2 border-primary-500 pb-1',
                }}
                inactiveProps={{
                  className:
                    'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white pb-1 border-b-2 border-transparent transition-colors',
                }}
              >
                Criar enquete
              </Link>
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{
                  className:
                    'font-semibold text-neutral-900 dark:text-white border-b-2 border-primary-500 pb-1',
                }}
                inactiveProps={{
                  className:
                    'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white pb-1 border-b-2 border-transparent transition-colors',
                }}
              >
                Enquetes
              </Link>
            </nav>

            {/* Ações: Alternância de Tema e Usuário */}
            <div className="flex items-center gap-2 pl-4 border-l border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Alternar tema claro/escuro"
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                title={
                  theme === 'dark'
                    ? 'Mudar para modo claro'
                    : 'Mudar para modo escuro'
                }
              >
                {theme === 'dark' ? (
                  <Sun size={19} className="text-amber-400" />
                ) : (
                  <Moon size={19} className="text-neutral-600" />
                )}
              </button>

              {user && (
                <div className="flex items-center gap-2 ml-1">
                  <span
                    className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[120px] truncate hidden sm:inline"
                    title={user.email || user.displayName || 'Anônimo'}
                  >
                    {user.isAnonymous
                      ? 'Anônimo'
                      : user.displayName || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label="Encerrar sessão"
                    title="Desconectar"
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Devtools apenas em ambiente de desenvolvimento */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </div>
  )
}
