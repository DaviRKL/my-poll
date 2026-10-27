import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: PollsListPage,
})

function PollsListPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Página: Lista de Enquetes
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Acompanhe, participe e vote nas enquetes ativas em tempo real.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-400 transition-colors w-fit shadow-xs"
        >
          Criar enquete
        </Link>
      </div>

      {/* Estrutura Base / Placeholder: Filtro de Status */}
      <section className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Filtro por status (Todas, Abertas, Encerradas) - A ser implementado
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-500 text-white cursor-pointer"
            >
              Todas
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              Abertas
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              Encerradas
            </button>
          </div>
        </div>
      </section>

      {/* Estrutura Base / Placeholder: Grid de Cards de Enquetes */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          Enquetes Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Mockup de Demonstração navegando para a rota de votação */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-500/10 text-primary-500">
                Aberta
              </span>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Qual funcionalidade você mais espera no My Poll?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Criada recentemente • Exemplo de card
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/poll/$pollId"
                params={{ pollId: 'demo-123' }}
                className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors inline-flex items-center gap-1"
              >
                Votar agora &rarr;
              </Link>
            </div>
          </div>

          {/* Placeholders adicionais do grid */}
          <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-center p-8 text-sm text-neutral-500 dark:text-neutral-400 min-h-[160px]">
            Área reservada para renderização dinâmica dos cards
          </div>

          <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-center p-8 text-sm text-neutral-500 dark:text-neutral-400 min-h-[160px]">
            Área reservada para renderização dinâmica dos cards
          </div>
        </div>
      </section>
    </div>
  )
}
