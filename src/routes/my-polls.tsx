import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, ChevronDown, Loader2, PlusCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthPrompt } from '../components/AuthPrompt'
import { Button } from '../components/ui/Button'
import { PollCard } from '../components/PollCard'
import { SearchBar } from '../components/ui/SearchBar'
import { SortDropdown, type SortOrder } from '../components/ui/SortDropdown'
import { useAuth } from '../hooks/useAuth'
import { useMyPolls } from '../hooks/useMyPolls'
import { formatPollDate } from '../utils/formatDate'
import { filterAndSortPolls } from '../utils/filterAndSortPolls'
import type { PollStatus } from '../types'

export const Route = createFileRoute('/my-polls')({
  component: MyPollsPage,
})

function MyPollsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { polls, loading, error, refetch } = useMyPolls(user?.uid ?? null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedStatus, setSelectedStatus] = useState<PollStatus | ''>('')
  const visiblePolls = useMemo(
    () => filterAndSortPolls(polls, searchTerm, sortOrder, selectedStatus),
    [polls, searchTerm, sortOrder, selectedStatus],
  )

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
        title={t('auth.myPollsTitle', 'Entre para ver suas enquetes')}
        description={t(
          'auth.myPollsDescription',
          'Faça login para visualizar as enquetes que você criou.',
        )}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t('nav.myPolls', 'Minhas Enquetes')}
        </h1>
      </div>

      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div className="w-full md:w-1/3">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
          <SortDropdown value={sortOrder} onChange={setSortOrder} />
          <div className="w-full sm:w-44">
            <label
              htmlFor="my-polls-status-filter"
              className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              {t('home.statusLabel', 'Status')}
            </label>
            <div className="relative">
              <select
                id="my-polls-status-filter"
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
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {t('common.tryAgain', 'Tentar novamente')}
          </Button>
        </div>
      )}

      {!loading && !error && visiblePolls.length === 0 && (
        <div className="p-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-4 bg-white dark:bg-neutral-800/40">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            {polls.length > 0
              ? t('home.searchEmpty', 'Nenhuma enquete corresponde à busca.')
              : t('home.noPollsCreated', 'Você ainda não possui enquetes criadas')}
          </p>
          {polls.length === 0 && (
            <Link to="/create">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle size={16} />}>
                {t('home.createButton', 'Criar enquete agora')}
              </Button>
            </Link>
          )}
        </div>
      )}

      {!loading && !error && visiblePolls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visiblePolls.map((poll) => (
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
      )}
    </div>
  )
}
