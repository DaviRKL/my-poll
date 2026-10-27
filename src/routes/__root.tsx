import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white transition-colors duration-200">
      {/* Cabeçalho / Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo "My Poll" à esquerda */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-black tracking-tight text-primary-500 hover:text-primary-400 transition-colors"
            >
              My Poll
            </Link>
          </div>

          {/* Menu de Navegação à direita */}
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <Link
              to="/"
              activeProps={{
                className: 'font-semibold text-primary-500 dark:text-primary-400',
              }}
              inactiveProps={{
                className: 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white',
              }}
              className="transition-colors"
            >
              Enquetes
            </Link>
            <Link
              to="/create"
              activeProps={{
                className: 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-neutral-900',
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-400 transition-colors shadow-xs"
            >
              Criar enquete
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal (Outlet das rotas filhas) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Devtools apenas em ambiente de desenvolvimento */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </div>
  )
}
