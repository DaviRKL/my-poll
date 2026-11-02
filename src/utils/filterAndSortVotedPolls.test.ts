import { describe, expect, it } from 'vitest'
import type { VotedPoll } from '../services/pollService'
import { filterAndSortVotedPolls } from './filterAndSortVotedPolls'

const polls: VotedPoll[] = [
  {
    id: 'older-vote',
    title: 'Community ideas',
    startDate: new Date('2026-01-01T10:00:00'),
    endDate: new Date('2026-01-10T18:00:00'),
    status: 'iniciado',
    options: [],
    createdBy: 'creator-1',
    createdAt: new Date('2026-01-01T09:00:00'),
    votedAt: new Date('2026-02-01T09:00:00'),
  },
  {
    id: 'newer-vote',
    title: 'React poll',
    startDate: new Date('2026-02-01T10:00:00'),
    endDate: new Date('2026-02-15T18:00:00'),
    status: 'em andamento',
    options: [],
    createdBy: 'creator-2',
    createdAt: new Date('2026-02-01T09:00:00'),
    votedAt: new Date('2026-02-02T09:00:00'),
  },
]

describe('filterAndSortVotedPolls', () => {
  it('filters titles case-insensitively and sorts by recent votes', () => {
    expect(
      filterAndSortVotedPolls(polls, 'REACT', '', 'desc').map((poll) => poll.id),
    ).toEqual(['newer-vote'])
    expect(
      filterAndSortVotedPolls(polls, '', '', 'desc').map((poll) => poll.id),
    ).toEqual(['newer-vote', 'older-vote'])
  })

  it('sorts oldest votes first and applies status together with search', () => {
    expect(
      filterAndSortVotedPolls(polls, 'community', 'iniciado', 'asc').map(
        (poll) => poll.id,
      ),
    ).toEqual(['older-vote'])
    expect(
      filterAndSortVotedPolls(polls, '', '', 'asc').map((poll) => poll.id),
    ).toEqual(['older-vote', 'newer-vote'])
  })
})
