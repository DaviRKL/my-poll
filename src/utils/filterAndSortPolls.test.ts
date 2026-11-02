import { describe, expect, it } from 'vitest'
import type { Poll } from '../types'
import { filterAndSortPolls } from './filterAndSortPolls'

const polls: Poll[] = [
  {
    id: 'older',
    title: 'Community ideas',
    startDate: new Date('2026-01-01T10:00:00'),
    endDate: new Date('2026-01-10T18:00:00'),
    status: 'iniciado',
    options: [],
    createdBy: 'user-1',
    createdAt: new Date('2026-01-01T09:00:00'),
  },
  {
    id: 'newer',
    title: 'React poll',
    startDate: new Date('2026-02-01T10:00:00'),
    endDate: new Date('2026-02-15T18:00:00'),
    status: 'em andamento',
    options: [],
    createdBy: 'user-1',
    createdAt: new Date('2026-02-01T09:00:00'),
  },
]

describe('filterAndSortPolls', () => {
  it('filters titles case-insensitively and sorts newest first by default', () => {
    expect(filterAndSortPolls(polls, 'REACT', 'desc').map((poll) => poll.id)).toEqual([
      'newer',
    ])
    expect(filterAndSortPolls(polls, '', 'desc').map((poll) => poll.id)).toEqual([
      'newer',
      'older',
    ])
  })

  it('sorts oldest first and combines search and status filters', () => {
    expect(filterAndSortPolls(polls, 'poll', 'asc', 'em andamento').map((poll) => poll.id)).toEqual([
      'newer',
    ])
    expect(filterAndSortPolls(polls, '', 'asc').map((poll) => poll.id)).toEqual([
      'older',
      'newer',
    ])
  })
})
