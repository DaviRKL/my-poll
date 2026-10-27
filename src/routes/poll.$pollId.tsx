import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/poll/$pollId')({
  component: PollDetailsPage,
})

function PollDetailsPage() {
  const { pollId } = Route.useParams()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navegação / Breadcrumb */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          <Link to="/" className="hover:text-primary-500 transition-colors">
            Enquetes
          </Link>
          <span>/</span>
          <span className="font-mono text-xs">{pollId}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Página: Votação da Enquete ID: {pollId}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Detalhes e interface de votação em tempo real para a enquete selecionada.
        </p>
      </div>

      {/* Estrutura Base / Placeholder: Card de Votação */}
      <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Em andamento
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            ID: {pollId}
          </span>
        </div>

        {/* Placeholder: Opções de Votação */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Pergunta da enquete aparecerá aqui
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Selecione uma opção para registrar seu voto (em tempo real via Firebase):
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Opção de exemplo A
              </span>
              <span className="text-xs text-neutral-400">0% (0 votos)</span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Opção de exemplo B
              </span>
              <span className="text-xs text-neutral-400">0% (0 votos)</span>
            </div>
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            &larr; Voltar para todas as enquetes
          </Link>
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg opacity-50 cursor-not-allowed shadow-xs"
          >
            Confirmar Voto
          </button>
        </div>
      </div>
    </div>
  )
}
