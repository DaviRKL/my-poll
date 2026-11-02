import { act, renderHook, waitFor } from '@testing-library/react'
import { getUserPolls } from '../services/pollService'
import { useMyPolls } from './useMyPolls'
import type { Poll } from '../types'

vi.mock('../services/pollService', () => ({
  getUserPolls: vi.fn(),
}))

describe('useMyPolls', () => {
  it('loads polls for the requested user', async () => {
    const polls: Poll[] = [
      {
        id: 'poll-1',
        title: 'My poll',
        startDate: new Date('2026-01-01T10:00:00'),
        endDate: new Date('2026-01-10T18:00:00'),
        status: 'iniciado',
        options: [],
        createdBy: 'user-1',
        createdAt: new Date('2026-01-01T09:00:00'),
      },
    ]
    vi.mocked(getUserPolls).mockResolvedValue(polls)

    const { result } = renderHook(() => useMyPolls('user-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(getUserPolls).toHaveBeenCalledWith('user-1')
    expect(result.current.polls).toEqual(polls)
    expect(result.current.error).toBeNull()
  })

  it('clears the poll list when there is no authenticated user', async () => {
    const { result } = renderHook(() => useMyPolls(null))

    await act(async () => {})

    expect(result.current.polls).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(getUserPolls).not.toHaveBeenCalled()
  })
})
