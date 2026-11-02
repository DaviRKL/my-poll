import type { VotedPoll } from '../services/pollService'
import type { SortOrder } from '../components/ui/SortDropdown'
import type { PollStatus } from '../types'

function getTimestamp(value: VotedPoll['votedAt']): number {
  return value instanceof Date ? value.getTime() : value.toMillis()
}

export function filterAndSortVotedPolls(
  polls: VotedPoll[],
  searchTerm: string,
  statusFilter: PollStatus | '',
  sortOrder: SortOrder,
): VotedPoll[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase()

  return polls
    .filter(
      (poll) =>
        poll.title.toLocaleLowerCase().includes(normalizedSearch) &&
        (statusFilter === '' || poll.status === statusFilter),
    )
    .sort((a, b) =>
      sortOrder === 'desc'
        ? getTimestamp(b.votedAt) - getTimestamp(a.votedAt)
        : getTimestamp(a.votedAt) - getTimestamp(b.votedAt),
    )
}
