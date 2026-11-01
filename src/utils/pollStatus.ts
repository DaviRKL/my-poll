import type { PollStatus } from '../types'

const POLL_STATUSES: readonly PollStatus[] = [
  'não iniciado',
  'iniciado',
  'em andamento',
  'finalizado',
]

export function isPollStatus(status: unknown): status is PollStatus {
  return (
    typeof status === 'string' &&
    POLL_STATUSES.some((pollStatus) => pollStatus === status)
  )
}

export function getInitialPollStatus(
  startDate: Date,
  endDate: Date,
  now: Date,
): PollStatus {
  if (startDate > now) {
    return 'não iniciado'
  }

  if (endDate < now) {
    return 'finalizado'
  }

  return 'iniciado'
}

export function isPollVotingActive(status: PollStatus | undefined): boolean {
  return status === 'iniciado' || status === 'em andamento'
}

export function getPollStatusAfterVote(status: PollStatus): PollStatus {
  return status === 'iniciado' ? 'em andamento' : status
}
