import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, Loader2, LogIn, ArrowLeft } from 'lucide-react'
import { usePoll } from '../hooks/usePoll'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PollResultBar } from '../components/PollResultBar'
import { formatPollDate } from '../utils/formatDate'

export const Route = createFileRoute('/poll/$pollId')({
  component: PollDetailsPage,
})

function PollDetailsPage() {
  const { pollId } = Route.useParams()
  const navigate = useNavigate()
  const { user, loginWithGoogle, loginAnon } = useAuth()
  const { poll, loading, hasVoted, handleVote, isVotingActive } = usePoll(pollId)

  // Estado local para opção selecionada
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  // Controle de alternância manual para tela de resultados (botão "Resultados")
  const [showResultsManual, setShowResultsManual] = useState(false)
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  // Deve exibir os resultados se o usuário já votou OU se clicou no botão "Resultados"
  const isViewingResults = hasVoted || showResultsManual

  // Cálculo de votos totais para percentuais
  const totalVotes =
    poll?.options?.reduce((acc, opt) => acc + (opt.votes || 0), 0) ?? 0

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVoteError(null)

    if (!selectedOptionId) {
      setVoteError('Por favor, selecione uma opção antes de votar.')
      return
    }

    if (!poll) return

    const optionIndex = poll.options.findIndex((o) => o.id === selectedOptionId)
    if (optionIndex === -1) {
      setVoteError('Opção inválida selecionada.')
      return
    }

    setVoting(true)
    try {
      await handleVote(selectedOptionId, optionIndex)
    } catch (err) {
      console.error(err)
      setVoteError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao registrar seu voto.',
      )
    } finally {
      setVoting(false)
    }
  }

  // Estado: Carregando...
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-500 dark:text-neutral-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-sm">Carregando enquete...</p>
      </div>
    )
  }

  // Estado: Enquete não encontrada
  if (!poll) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Enquete não encontrada
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            A enquete solicitada não existe ou foi removida.
          </p>
          <Link to="/">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16} />}>
              Voltar para o início
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Estado: Usuário não autenticado (!user)
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card className="text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto">
            <LogIn size={24} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {poll.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Faça login para participar e votar nesta enquete em tempo real.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => loginWithGoogle()}
            >
              Entrar com Google
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => loginAnon()}
            >
              Continuar como Anônimo
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-6">
      {/* VOTAÇÃO OU RESULTADOS BASEADOS NO DESIGN FIGMA */}
      <Card className="shadow-lg">
        {/* ================= TELA DE RESULTADOS (Poll Result.png) ================= */}
        {isViewingResults ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {poll.title}
              </h1>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Total de votos registrados: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{totalVotes}</span>
              </p>
            </div>

            {/* Lista de Barras de Resultado */}
            <div className="space-y-3">
              {poll.options.map((option) => {
                const votes = option.votes || 0
                const percentage =
                  totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0

                return (
                  <PollResultBar
                    key={option.id}
                    label={option.text}
                    votes={votes}
                    percentage={percentage}
                  />
                )
              })}
            </div>

            {/* Botão "Voltar" conforme Figma */}
            <div className="pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!hasVoted) {
                    setShowResultsManual(false)
                  } else {
                    navigate({ to: '/' })
                  }
                }}
              >
                Voltar
              </Button>
            </div>
          </div>
        ) : (
          /* ================= TELA DE VOTAÇÃO (Poll Details.png) ================= */
          <form onSubmit={handleVoteSubmit} className="space-y-6">
            {/* Mensagem de Erro de Votação */}
            {voteError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs sm:text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{voteError}</span>
              </div>
            )}

            {/* Cabeçalho da Enquete */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {poll.title}
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {isVotingActive
                  ? 'Escolha uma resposta'
                  : `Votação fechada (${poll.status === 'não iniciado' ? `inicia em ${formatPollDate(poll.startDate)}` : 'encerrada'})`}
              </p>
            </div>

            {/* Lista de Opções (Radio Buttons) */}
            <fieldset disabled={!isVotingActive || voting} className="space-y-3">
              {poll.options.map((option) => {
                const isSelected = selectedOptionId === option.id

                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-primary-500/50 bg-primary-50/50 dark:bg-primary-950/20'
                        : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-700/40'
                    } ${!isVotingActive ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`poll-${poll.id}-option`}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setSelectedOptionId(option.id)}
                      disabled={!isVotingActive || voting}
                      className="w-4 h-4 text-primary-500 accent-primary-500 focus:ring-primary-500/30 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {option.text}
                    </span>
                  </label>
                )
              })}
            </fieldset>

            {/* Botões "Votar" e "Resultados" conforme Figma */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={!isVotingActive || !selectedOptionId || voting}
                leftIcon={voting ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {voting ? 'Votando...' : 'Votar'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowResultsManual(true)}
              >
                Resultados
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
