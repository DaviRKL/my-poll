import type { Poll } from '../types'
import type { PollStatus } from '../types'
import type { SortOrder } from '../components/ui/SortDropdown'

export function filterAndSortPolls(
  polls: Poll[],
  searchTerm: string,
  sortOrder: SortOrder,
  statusFilter: PollStatus | '' = '',
): Poll[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase()

  return polls
    .filter(
      (poll) =>
        poll.title.toLocaleLowerCase().includes(normalizedSearch) &&
        (statusFilter === '' || poll.status === statusFilter),
    )
    .sort((a, b) => {
      const aCreatedAt =
        a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.toMillis()
      const bCreatedAt =
        b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.toMillis()
      return sortOrder === 'desc'
        ? bCreatedAt - aCreatedAt
        : aCreatedAt - bCreatedAt
    })
}
