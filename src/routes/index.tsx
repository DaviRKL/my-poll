import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ChevronDown, Loader2, LockKeyhole, PlusCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthPrompt } from '../components/AuthPrompt'
import { PollCard } from '../components/PollCard'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { SearchBar } from '../components/ui/SearchBar'
import { SortDropdown, type SortOrder } from '../components/ui/SortDropdown'
import { useAuth } from '../hooks/useAuth'
import { useMyPolls } from '../hooks/useMyPolls'
import { useMyVotes } from '../hooks/useMyVotes'
import { usePagination } from '../hooks/usePagination'
import { usePolls } from '../hooks/usePolls'
import type { PollStatus } from '../types'
import { filterAndSortPolls } from '../utils/filterAndSortPolls'
import { filterAndSortVotedPolls } from '../utils/filterAndSortVotedPolls'
import { formatPollDate } from '../utils/formatDate'

export type PollScope = 'all' | 'mine' | 'voted'

function isPollScope(scope: unknown): scope is PollScope {
  return scope === 'all' || scope === 'mine' || scope === 'voted'
}

export function validatePollScopeSearch(
  search: Record<string, unknown>,
): { scope?: PollScope } {
  return { scope: isPollScope(search.scope) ? search.scope : 'all' }
}

export const Route = createFileRoute('/')({
  validateSearch: validatePollScopeSearch,
  component: PollsListPage,
})

const scopeOptions: PollScope[] = ['all', 'mine', 'voted']

export function PollsListPage() {
  const navigate = useNavigate({ from: '/' })
  const scope = Route.useSearch().scope ?? 'all'
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<PollStatus | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const allPolls = usePolls(selectedStatus, scope === 'all')
  const myPolls = useMyPolls(scope === 'mine' ? user?.uid ?? null : null)
  const myVotes = useMyVotes(scope === 'voted' ? user?.uid ?? null : null)

  const sourcePolls =
    scope === 'mine'
      ? myPolls.polls
      : scope === 'voted'
        ? myVotes.votedPolls
        : allPolls.polls
  const loading =
    scope === 'mine'
      ? authLoading || myPolls.loading
      : scope === 'voted'
        ? authLoading || myVotes.loading
        : allPolls.loading
  const error =
    scope === 'mine'
      ? myPolls.error
      : scope === 'voted'
        ? myVotes.error
        : allPolls.error
  const refetch =
    scope === 'mine'
      ? myPolls.refetch
      : scope === 'voted'
        ? myVotes.refetch
        : allPolls.refetch

  const visiblePolls = useMemo(() => {
    if (scope === 'voted') {
      return filterAndSortVotedPolls(
        myVotes.votedPolls,
        searchTerm,
        selectedStatus,
        sortOrder,
      )
    }

    return filterAndSortPolls(
      sourcePolls,
      searchTerm,
      sortOrder,
      selectedStatus,
    )
  }, [
    scope,
    sourcePolls,
    myVotes.votedPolls,
    searchTerm,
    selectedStatus,
    sortOrder,
  ])
  const { paginatedItems, currentPage, totalPages, goToPage, resetPage } =
    usePagination(visiblePolls, 10)

  useEffect(() => {
    resetPage()
  }, [scope, searchTerm, selectedStatus, sortOrder, resetPage])

  const getStatusLabel = (status: PollStatus | '') => {
    switch (status) {
      case 'não iniciado':
        return t('home.statusNotStarted', 'Não iniciado')
      case 'iniciado':
        return t('home.statusStarted', 'Iniciado')
      case 'em andamento':
        return t('home.statusInProgress', 'Em andamento')
      case 'finalizado':
        return t('home.statusFinished', 'Finalizado')
      default:
        return t('home.statusAll', 'Todas')
    }
  }

  const changeScope = (newScope: PollScope) => {
    if (newScope !== 'all' && !user) {
      setShowAuthPrompt(true)
      return
    }

    setShowAuthPrompt(false)
    resetPage()
    void navigate({ search: { scope: newScope } })
  }

  const getScopeLabel = (scopeOption: PollScope) => {
    switch (scopeOption) {
      case 'mine':
        return t('home.myPolls', 'Criadas por mim')
      case 'voted':
        return t('home.myVotes', 'Votadas por mim')
      default:
        return t('home.allPolls', 'Todas')
    }
  }

  const showAuthDialog =
    showAuthPrompt || (scope !== 'all' && !user && !authLoading)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t('home.title', 'Enquetes')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t('home.subtitle', 'Encontre aqui a sua enquete')}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={t('home.scopeLabel', 'Escopo das enquetes')}
        className="mx-auto flex w-full max-w-2xl rounded-xl border border-neutral-200 bg-white p-1 shadow-xs dark:border-neutral-700 dark:bg-neutral-800"
      >
        {scopeOptions.map((scopeOption) => {
          const disabledScope = scopeOption !== 'all' && !user
          return (
            <button
              key={scopeOption}
              type="button"
              role="tab"
              aria-selected={scope === scopeOption}
              aria-disabled={disabledScope}
              onClick={() => changeScope(scopeOption)}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                scope === scopeOption
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
              } ${disabledScope ? 'opacity-55' : ''}`}
            >
              {disabledScope && <LockKeyhole size={14} aria-hidden="true" />}
              {getScopeLabel(scopeOption)}
            </button>
          )
        })}
      </div>

      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div className="w-full md:w-1/3">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
          <SortDropdown
            value={sortOrder}
            onChange={setSortOrder}
            descendingLabel={
              scope === 'voted'
                ? t('search.sortVotedAtDesc', 'Votos mais recentes')
                : t('search.sortCreatedAtDesc', 'Mais recentes')
            }
            ascendingLabel={
              scope === 'voted'
                ? t('search.sortVotedAtAsc', 'Votos mais antigos')
                : t('search.sortCreatedAtAsc', 'Mais antigas')
            }
          />
          <div className="w-full sm:w-44">
            <label
              htmlFor="status-filter"
              className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              {t('home.statusLabel', 'Status')}
            </label>
            <div className="relative">
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as PollStatus | '')
                }
                className="w-full appearance-none rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 pr-8 text-sm font-medium text-neutral-900 dark:text-neutral-100 shadow-xs transition-colors focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">{t('home.statusAll', 'Todas')}</option>
                <option value="não iniciado">
                  {t('home.statusNotStarted', 'Não iniciado')}
                </option>
                <option value="iniciado">
                  {t('home.statusStarted', 'Iniciado')}
                </option>
                <option value="em andamento">
                  {t('home.statusInProgress', 'Em andamento')}
                </option>
                <option value="finalizado">
                  {t('home.statusFinished', 'Finalizado')}
                </option>
              </select>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center space-y-3 py-20 text-neutral-500 dark:text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm">{t('common.loadingPolls', 'Carregando enquetes...')}</p>
        </div>
      )}

      {!loading && error && (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="text-xs"
          >
            {t('common.tryAgain', 'Tentar novamente')}
          </Button>
        </div>
      )}

      {!loading && !error && visiblePolls.length === 0 && (
        <div className="space-y-4 rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-800/40">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            {sourcePolls.length > 0
              ? t('home.searchEmpty', 'Nenhuma enquete corresponde à busca.')
              : scope === 'mine'
                ? t(
                    'home.noPollsCreated',
                    'Você ainda não possui enquetes criadas',
                  )
                : scope === 'voted'
                  ? t(
                      'home.noVotesFound',
                      'Você ainda não participou de nenhuma enquete.',
                    )
                  : t('home.emptyTitle', 'Nenhuma enquete encontrada.')}
          </p>
          {scope === 'all' && sourcePolls.length === 0 && (
            <>
              <p className="mx-auto max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
                {selectedStatus
                  ? t('home.emptyFiltered', {
                      status: getStatusLabel(selectedStatus),
                      defaultValue: `Não há enquetes com o status "${getStatusLabel(selectedStatus)}". Altere o filtro ou crie uma nova enquete.`,
                    })
                  : t(
                      'home.emptyGeneral',
                      'Seja o primeiro a publicar uma nova enquete em tempo real!',
                    )}
              </p>
              <div className="pt-2">
                <Link to="/create">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle size={16} />}
                  >
                    {t('home.createButton', 'Criar enquete agora')}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {!loading && !error && visiblePolls.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {paginatedItems.map((poll) => (
            <PollCard
              key={poll.id}
              title={poll.title}
              startDate={formatPollDate(poll.startDate)}
              endDate={formatPollDate(poll.endDate)}
              onClick={() => {
                if (poll.id) {
                  void navigate({
                    to: '/poll/$pollId',
                    params: { pollId: poll.id },
                  })
                }
              }}
            />
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}

      {showAuthDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('auth.title', 'Inicie sessão para continuar')}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowAuthPrompt(false)
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
            <button
              type="button"
              aria-label={t('common.close', 'Fechar')}
              onClick={() => setShowAuthPrompt(false)}
              className="absolute right-6 top-6 z-10 rounded-md p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <X size={18} />
            </button>
            <AuthPrompt
              title={t('auth.privatePollsTitle', 'Entre para ver suas enquetes')}
              description={t(
                'auth.privatePollsDescription',
                'Faça login para acessar suas enquetes e votos.',
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
