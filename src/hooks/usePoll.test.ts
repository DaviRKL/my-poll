import { act, renderHook, waitFor } from '@testing-library/react'
import { listenToPoll, updatePollStatus } from '../services/pollService'
import { usePoll } from './usePoll'
import type { Poll } from '../types'

const mocks = vi.hoisted(() => ({
  user: { uid: 'poll-owner' } as { uid: string } | null,
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

vi.mock('../services/pollService', () => ({
  listenToPoll: vi.fn(),
  voteOnPoll: vi.fn(),
  checkUserHasVoted: vi.fn().mockResolvedValue(false),
  updatePollStatus: vi.fn().mockResolvedValue(undefined),
}))

describe('usePoll ownership', () => {
  const poll: Poll = {
    id: 'poll-1',
    title: 'Poll title',
    startDate: new Date('2026-01-01T10:00:00'),
    endDate: new Date('2026-01-10T18:00:00'),
    status: 'iniciado',
    options: [],
    createdBy: 'poll-owner',
    createdAt: new Date('2026-01-01T09:00:00'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { uid: 'poll-owner' }
    vi.mocked(listenToPoll).mockImplementation((_pollId, onPoll) => {
      onPoll(poll)
      return vi.fn()
    })
    vi.mocked(updatePollStatus).mockResolvedValue(undefined)
  })

  it('identifies the creator and persists their status change', async () => {
    const { result } = renderHook(() => usePoll('poll-1'))

    await waitFor(() => expect(result.current.isOwner).toBe(true))
    await act(async () => {
      await result.current.changeStatus('finalizado')
    })

    expect(updatePollStatus).toHaveBeenCalledWith('poll-1', 'finalizado')
    expect(result.current.poll?.status).toBe('finalizado')
  })

  it('does not allow another user to change the poll status', async () => {
    mocks.user = { uid: 'another-user' }
    const { result } = renderHook(() => usePoll('poll-1'))

    await waitFor(() => expect(result.current.isOwner).toBe(false))
    await expect(result.current.changeStatus('finalizado')).rejects.toThrow(
      'Somente o criador pode alterar o status desta enquete.',
    )
    expect(updatePollStatus).not.toHaveBeenCalled()
  })
})
