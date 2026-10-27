import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ChevronDown, PlusCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePolls } from '../hooks/usePolls'
import { PollCard } from '../components/PollCard'
import { Button } from '../components/ui/Button'
import { formatPollDate } from '../utils/formatDate'
import type { PollStatus } from '../types'

export const Route = createFileRoute('/')({
  component: PollsListPage,
})

function PollsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedStatus, setSelectedStatus] = useState<PollStatus | ''>('')
  const { polls, loading, error, refetch } = usePolls(selectedStatus)

  const getStatusLabel = (status: PollStatus | '') => {
    switch (status) {
      case 'não iniciado':
        return t('home.statusNotStarted', 'Não iniciado')
      case 'em andamento':
        return t('home.statusInProgress', 'Em andamento')
      case 'finalizado':
        return t('home.statusFinished', 'Finalizado')
      default:
        return t('home.statusAll', 'Todas')
    }
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho e Filtro de Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
        {/* Espaçador invisível à esquerda para manter o título centralizado */}
        <div className="hidden sm:block w-36" aria-hidden="true" />

        {/* Título Centralizado conforme Figma */}
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t('home.title', 'Enquetes')}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t('home.subtitle', 'Encontre aqui a sua enquete')}
          </p>
        </div>

        {/* Dropdown de Status à direita */}
        <div className="w-full sm:w-auto flex flex-col items-start sm:items-end">
          <label
            htmlFor="status-filter"
            className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1"
          >
            {t('home.statusLabel', 'Status')}
          </label>
          <div className="relative w-full sm:w-44">
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as PollStatus | '')
              }}
              className="w-full appearance-none px-3.5 py-1.5 pr-8 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer transition-colors"
            >
              <option value="">{t('home.statusAll', 'Todas')}</option>
              <option value="não iniciado">
                {t('home.statusNotStarted', 'Não iniciado')}
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Estado: Carregando... */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm">{t('common.loadingPolls', 'Carregando enquetes...')}</p>
        </div>
      )}

      {/* Estado: Erro */}
      {!loading && error && (
        <div className="p-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            {t('common.tryAgain', 'Tentar novamente')}
          </Button>
        </div>
      )}

      {/* Estado: Nenhuma enquete encontrada */}
      {!loading && !error && polls.length === 0 && (
        <div className="p-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-4 bg-white dark:bg-neutral-800/40">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            {t('home.emptyTitle', 'Nenhuma enquete encontrada.')}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
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
        </div>
      )}

      {/* Grid Responsivo de Cards de Enquetes */}
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
