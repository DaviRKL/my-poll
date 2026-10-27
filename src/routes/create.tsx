import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/create')({
  component: CreatePollPage,
})

function CreatePollPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          <Link to="/" className="hover:text-primary-500 transition-colors">
            Enquetes
          </Link>
          <span>/</span>
          <span>Criar</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Página: Criar nova enquete
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Preencha os dados abaixo para configurar e publicar uma nova enquete.
        </p>
      </div>

      {/* Estrutura Base / Placeholder: Formulário de Criação */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-6"
      >
        {/* Campo 1: Título */}
        <div className="space-y-2">
          <label
            htmlFor="poll-title"
            className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200"
          >
            Título da Enquete
          </label>
          <input
            id="poll-title"
            type="text"
            disabled
            placeholder="Ex: Qual seu editor de código preferido?"
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed text-sm focus:outline-hidden"
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Estrutura base para o input do título da enquete.
          </span>
        </div>

        {/* Campo 2: Opções de Resposta */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Opções de Voto
          </label>
          <div className="space-y-2.5">
            <input
              type="text"
              disabled
              placeholder="Opção 1 (Ex: VS Code)"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed text-sm focus:outline-hidden"
            />
            <input
              type="text"
              disabled
              placeholder="Opção 2 (Ex: Neovim)"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed text-sm focus:outline-hidden"
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Estrutura base para a lista dinâmica de opções de resposta.
          </p>
        </div>

        {/* Campo 3: Datas / Período */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="start-date"
              className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              Data de Início
            </label>
            <input
              id="start-date"
              type="datetime-local"
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed text-sm focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="end-date"
              className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              Data de Encerramento
            </label>
            <input
              id="end-date"
              type="datetime-local"
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed text-sm focus:outline-hidden"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="button"
            disabled
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg opacity-50 cursor-not-allowed shadow-xs"
          >
            Salvar Enquete
          </button>
        </div>
      </form>
    </div>
  )
}
