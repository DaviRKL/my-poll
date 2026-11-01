import { useState } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { LogOut, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Header Superior */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700/60 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="text-2xl font-black tracking-tight text-primary-500 hover:text-primary-400 transition-colors select-none"
          >
            {t('common.appName', 'My Poll')}
          </Link>

          <button
            type="button"
            aria-label={
              isMobileMenuOpen
                ? t('nav.closeMenu', 'Fechar menu')
                : t('nav.openMenu', 'Abrir menu')
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden p-2 -mr-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navegação completa para desktop */}
          <div className="hidden md:flex items-center gap-3 sm:gap-6">
            <nav className="flex items-center gap-3 sm:gap-6 text-sm">
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
                {t('nav.createPoll', 'Criar enquete')}
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
                {t('nav.polls', 'Enquetes')}
              </Link>
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-4 border-l border-neutral-200 dark:border-neutral-700">
              <LanguageSwitcher />
              <ThemeToggle />
              {user && (
                <div className="flex items-center gap-1.5 sm:gap-2 ml-1">
                  <span
                    className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[100px] sm:max-w-[150px] truncate"
                    title={user.displayName || user.email || t('common.anonymous', 'Anônimo')}
                  >
                    {user.isAnonymous
                      ? t('common.anonymous', 'Anônimo')
                      : user.displayName || user.email || t('common.anonymous', 'Anônimo')}
                  </span>
                  <button
                    type="button"
                    onClick={() => logout()}
                    aria-label={t('common.logoutAria', 'Sair da conta')}
                    title={t('common.logout', 'Sair')}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden border-t border-neutral-200 dark:border-neutral-700/60 px-4 py-4 sm:px-6"
          >
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                to="/create"
                onClick={closeMobileMenu}
                activeProps={{
                  className:
                    'rounded-lg px-3 py-2.5 font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700/50 transition-colors',
                }}
                inactiveProps={{
                  className:
                    'rounded-lg px-3 py-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors',
                }}
              >
                {t('nav.createPoll', 'Criar enquete')}
              </Link>
              <Link
                to="/"
                activeOptions={{ exact: true }}
                onClick={closeMobileMenu}
                activeProps={{
                  className:
                    'rounded-lg px-3 py-2.5 font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700/50 transition-colors',
                }}
                inactiveProps={{
                  className:
                    'rounded-lg px-3 py-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors',
                }}
              >
                {t('nav.polls', 'Enquetes')}
              </Link>
            </nav>

            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-neutral-200 dark:border-neutral-700 pt-3">
              <LanguageSwitcher />
              <ThemeToggle />
              {user && (
                <div className="ml-auto flex items-center gap-2">
                  <span
                    className="max-w-[180px] truncate text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    title={user.displayName || user.email || t('common.anonymous', 'Anônimo')}
                  >
                    {user.isAnonymous
                      ? t('common.anonymous', 'Anônimo')
                      : user.displayName || user.email || t('common.anonymous', 'Anônimo')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu()
                      void logout()
                    }}
                    aria-label={t('common.logoutAria', 'Sair da conta')}
                    title={t('common.logout', 'Sair')}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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
