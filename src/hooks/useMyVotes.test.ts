import { act, renderHook, waitFor } from '@testing-library/react'
import type { VotedPoll } from '../services/pollService'
import { getUserVotedPolls } from '../services/pollService'
import { useMyVotes } from './useMyVotes'

jest.mock('../services/pollService', () => ({
  getUserVotedPolls: jest.fn(),
}))

describe('useMyVotes', () => {
  it('loads voted polls for the requested user', async () => {
    const votedPolls: VotedPoll[] = [
      {
        id: 'poll-1',
        title: 'A poll I voted in',
        startDate: new Date('2026-01-01T10:00:00'),
        endDate: new Date('2026-01-10T18:00:00'),
        status: 'iniciado',
        options: [],
        createdBy: 'creator-1',
        createdAt: new Date('2026-01-01T09:00:00'),
        votedAt: new Date('2026-01-02T09:00:00'),
      },
    ]
    jest.mocked(getUserVotedPolls).mockResolvedValue(votedPolls)

    const { result } = renderHook(() => useMyVotes('user-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(getUserVotedPolls).toHaveBeenCalledWith('user-1')
    expect(result.current.votedPolls).toEqual(votedPolls)
    expect(result.current.error).toBeNull()
  })

  it('clears votes when there is no authenticated user', async () => {
    const { result } = renderHook(() => useMyVotes(null))

    await act(async () => {})

    expect(result.current.votedPolls).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(getUserVotedPolls).not.toHaveBeenCalled()
  })
})
