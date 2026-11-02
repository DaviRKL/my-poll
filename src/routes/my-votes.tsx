import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthPrompt } from '../components/AuthPrompt'
import { PollCard } from '../components/PollCard'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { SearchBar } from '../components/ui/SearchBar'
import { SortDropdown, type SortOrder } from '../components/ui/SortDropdown'
import { useAuth } from '../hooks/useAuth'
import { useMyVotes } from '../hooks/useMyVotes'
import { usePagination } from '../hooks/usePagination'
import type { PollStatus } from '../types'
import { filterAndSortVotedPolls } from '../utils/filterAndSortVotedPolls'
import { formatPollDate } from '../utils/formatDate'

export const Route = createFileRoute('/my-votes')({
  component: MyVotesPage,
})

function MyVotesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { votedPolls, loading, error, refetch } = useMyVotes(user?.uid ?? null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PollStatus | ''>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredPolls = useMemo(
    () =>
      filterAndSortVotedPolls(
        votedPolls,
        searchTerm,
        statusFilter,
        sortOrder,
      ),
    [votedPolls, searchTerm, statusFilter, sortOrder],
  )
  const { paginatedItems, currentPage, totalPages, goToPage, resetPage } =
    usePagination(filteredPolls, 10)

  useEffect(() => {
    resetPage()
  }, [searchTerm, statusFilter, sortOrder, resetPage])

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-sm">{t('common.loading', 'Carregando...')}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthPrompt
        title={t('auth.myVotesTitle', 'Entre para ver seus votos')}
        description={t(
          'auth.myVotesDescription',
          'Faça login para visualizar as enquetes em que você votou.',
        )}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t('nav.myVotes', 'Meus Votos')}
        </h1>
      </div>

      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div className="w-full md:w-1/3">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
          <SortDropdown
            value={sortOrder}
            onChange={setSortOrder}
            descendingLabel={t(
              'search.sortVotedAtDesc',
              'Votos mais recentes',
            )}
            ascendingLabel={t(
              'search.sortVotedAtAsc',
              'Votos mais antigos',
            )}
          />
          <div className="w-full sm:w-44">
            <label
              htmlFor="my-votes-status-filter"
              className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              {t('home.statusLabel', 'Status')}
            </label>
            <div className="relative">
              <select
                id="my-votes-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as PollStatus | '')
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
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm">{t('common.loading', 'Carregando...')}</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {t('common.tryAgain', 'Tentar novamente')}
          </Button>
        </div>
      )}

      {!loading && !error && filteredPolls.length === 0 && (
        <div className="p-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-4 bg-white dark:bg-neutral-800/40">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            {votedPolls.length === 0
              ? t(
                  'home.noVotesFound',
                  "Você ainda não participou de nenhuma enquete.",
                )
              : t(
                  'home.searchEmpty',
                  'Nenhuma enquete corresponde aos filtros selecionados.',
                )}
          </p>
        </div>
      )}

      {!loading && !error && filteredPolls.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedItems.map((poll) => (
              <PollCard
                key={poll.id}
                title={poll.title}
                startDate={formatPollDate(poll.startDate)}
                endDate={formatPollDate(poll.endDate)}
                onClick={() => {
                  if (poll.id) {
                    navigate({
                      to: '/poll/$pollId',
                      params: { pollId: poll.id },
                    })
                  }
                }}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  )
}
