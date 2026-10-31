import type { PollOption } from '../types'

export function normalizePollOptions(options: unknown): PollOption[] {
  const entries = Array.isArray(options)
    ? options.map((option, index) => [String(index), option] as const)
    : options !== null && typeof options === 'object'
      ? Object.entries(options)
      : null

  if (!entries) {
    throw new Error('Formato inválido de opções da enquete.')
  }

  return entries.map(([key, value]) => {
    if (value === null || typeof value !== 'object') {
      throw new Error('Formato inválido de opção da enquete.')
    }

    const option = value as Record<string, unknown>
    if (typeof option.text !== 'string') {
      throw new Error('Uma opção da enquete não possui um texto válido.')
    }

    return {
      id: typeof option.id === 'string' ? option.id : key,
      text: option.text,
      votes:
        typeof option.votes === 'number' && Number.isFinite(option.votes)
          ? option.votes
          : 0,
    }
  })
}

export function incrementPollOptionVotes(
  options: PollOption[],
  optionId: string,
): PollOption[] {
  if (!options.some((option) => option.id === optionId)) {
    throw new Error('Opção inválida selecionada.')
  }

  return options.map((option) =>
    option.id === optionId
      ? { ...option, votes: option.votes + 1 }
      : option,
  )
}
