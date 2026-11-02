import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthPrompt } from '../components/AuthPrompt'
import { Button } from '../components/ui/Button'
import { PollCard } from '../components/PollCard'
import { useAuth } from '../hooks/useAuth'
import { useMyPolls } from '../hooks/useMyPolls'
import { formatPollDate } from '../utils/formatDate'

export const Route = createFileRoute('/my-polls')({
  component: MyPollsPage,
})

function MyPollsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { polls, loading, error, refetch } = useMyPolls(user?.uid ?? null)

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

      {!loading && !error && polls.length === 0 && (
        <div className="p-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-4 bg-white dark:bg-neutral-800/40">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            {t(
              'home.noPollsCreated',
              'Você ainda não possui enquetes criadas',
            )}
          </p>
          <Link to="/create">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle size={16} />}>
              {t('home.createButton', 'Criar enquete agora')}
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && polls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
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
