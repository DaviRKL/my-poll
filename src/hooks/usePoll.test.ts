import { act, renderHook, waitFor } from '@testing-library/react'
import { listenToPoll, updatePollStatus } from '../services/pollService'
import { usePoll } from './usePoll'
import type { Poll } from '../types'

const mockAuthState = {
  user: { uid: 'poll-owner' } as { uid: string } | null,
}

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockAuthState.user }),
}))

jest.mock('../services/pollService', () => ({
  listenToPoll: jest.fn(),
  voteOnPoll: jest.fn(),
  checkUserHasVoted: jest.fn().mockResolvedValue(false),
  updatePollStatus: jest.fn().mockResolvedValue(undefined),
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
    jest.clearAllMocks()
    mockAuthState.user = { uid: 'poll-owner' }
    jest.mocked(listenToPoll).mockImplementation((_pollId, onPoll) => {
      onPoll(poll)
      return jest.fn()
    })
    jest.mocked(updatePollStatus).mockResolvedValue(undefined)
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
    mockAuthState.user = { uid: 'another-user' }
    const { result } = renderHook(() => usePoll('poll-1'))

    await waitFor(() => expect(result.current.isOwner).toBe(false))
    await expect(result.current.changeStatus('finalizado')).rejects.toThrow(
      'Somente o criador pode alterar o status desta enquete.',
    )
    expect(updatePollStatus).not.toHaveBeenCalled()
  })
})
