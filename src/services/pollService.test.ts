import {
  waitFor,
} from '@testing-library/react'
import {
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  Timestamp,
  updateDoc,
  type DocumentReference,
} from 'firebase/firestore'
import {
  getPolls,
  getUserPolls,
  getUserVotedPolls,
  listenToPoll,
  voteOnPoll,
} from './pollService'

jest.mock('../config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}))

jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual<typeof import('firebase/firestore')>(
    'firebase/firestore',
  )
  return {
    ...actual,
    collection: jest.fn((_db, name) => ({ name })),
    doc: jest.fn((_db, collection, id) => ({ collection, id })),
    query: jest.fn((...args) => args),
    where: jest.fn((...args) => args),
    orderBy: jest.fn((...args) => args),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    onSnapshot: jest.fn(),
    runTransaction: jest.fn(),
  }
})

const expiredPoll = {
  id: 'expired-poll',
  title: 'Expired poll',
  startDate: new Date('2026-01-01T10:00:00'),
  endDate: new Date('2026-01-02T10:00:00'),
  status: 'iniciado' as const,
  options: [{ id: 'option-1', text: 'Option 1', votes: 0 }],
  createdBy: 'creator-1',
  createdAt: new Date('2026-01-01T09:00:00'),
}

const createQuerySnapshot = (poll: typeof expiredPoll) => ({
  docs: [{ id: poll.id, data: () => ({ ...poll }) }],
})

describe('pollService lazy expiration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(updateDoc).mockResolvedValue(undefined)
  })

  it('returns expired polls as finalized and persists the status in the background', async () => {
    jest.mocked(getDocs).mockResolvedValue(
      createQuerySnapshot(expiredPoll) as never,
    )

    const polls = await getPolls()

    expect(polls[0].status).toBe('finalizado')
    await waitFor(() =>
      expect(updateDoc).toHaveBeenCalledWith(
        { collection: 'polls', id: expiredPoll.id },
        { status: 'finalizado' },
      ),
    )
  })

  it('removes expired polls from a stale status-filtered query', async () => {
    jest.mocked(getDocs).mockResolvedValue(
      createQuerySnapshot(expiredPoll) as never,
    )

    const polls = await getPolls('iniciado')

    expect(polls).toEqual([])
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1))
  })

  it('still returns expired polls when the background write fails', async () => {
    jest.mocked(getDocs).mockResolvedValue(
      createQuerySnapshot(expiredPoll) as never,
    )
    jest.mocked(updateDoc).mockRejectedValue(new Error('Permission denied'))
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const polls = await getPolls()

    expect(polls[0].status).toBe('finalizado')
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        `Falha ao finalizar a enquete expirada ${expiredPoll.id}.`,
        expect.any(Error),
      ),
    )
    errorSpy.mockRestore()
  })

  it('applies lazy expiration to polls created by the user', async () => {
    jest.mocked(getDocs).mockResolvedValue(
      createQuerySnapshot(expiredPoll) as never,
    )

    const polls = await getUserPolls('creator-1')

    expect(polls[0].status).toBe('finalizado')
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1))
  })

  it('applies lazy expiration to polls the user voted in', async () => {
    jest.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'expired-poll_user-1',
          data: () => ({
            pollId: expiredPoll.id,
            userId: 'user-1',
            optionId: 'option-1',
            votedAt: Timestamp.fromDate(new Date('2026-01-01T12:00:00')),
          }),
        },
      ],
    } as never)
    jest.mocked(getDoc).mockResolvedValue({
      id: expiredPoll.id,
      exists: (): boolean => true,
      data: () => ({ ...expiredPoll }),
    } as never)

    const polls = await getUserVotedPolls('user-1')

    expect(polls[0].status).toBe('finalizado')
    expect(polls[0].votedAt).toBeInstanceOf(Timestamp)
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1))
  })

  it('applies expiration in the realtime listener callback', async () => {
    let receiveSnapshot:
      | ((snapshot: {
          exists: () => boolean
          id: string
          data: () => Record<string, unknown>
        }) => void)
      | undefined
    jest.mocked(onSnapshot).mockImplementation(
      ((_reference: DocumentReference, callback: unknown) => {
        receiveSnapshot = callback as typeof receiveSnapshot
        return jest.fn()
      }) as never,
    )
    const onPoll = jest.fn()

    listenToPoll('expired-poll', onPoll, jest.fn())
    receiveSnapshot?.({
      exists: (): boolean => true,
      id: expiredPoll.id,
      data: () => ({ ...expiredPoll }),
    })

    await waitFor(() =>
      expect(onPoll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'finalizado' }),
      ),
    )
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1))
  })
})

describe('voteOnPoll status transitions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates an initiated poll to in progress atomically with the first vote', async () => {
    const transaction = {
      get: jest.fn(async (reference: { collection: string }) =>
        reference.collection === 'polls'
          ? {
              exists: (): boolean => true,
              data: () => ({
                status: 'iniciado',
                options: [{ id: 'option-1', text: 'Option 1', votes: 0 }],
              }),
            }
          : { exists: (): boolean => false },
      ),
      update: jest.fn(),
      set: jest.fn(),
    }
    jest.mocked(runTransaction).mockImplementation(
      async (_db, updateFunction) =>
        updateFunction(transaction as never),
    )

    await voteOnPoll('poll-1', 'option-1', 'user-1')

    expect(transaction.update).toHaveBeenCalledWith(
      { collection: 'polls', id: 'poll-1' },
      {
        options: [{ id: 'option-1', text: 'Option 1', votes: 1 }],
        status: 'em andamento',
      },
    )
    expect(transaction.set).toHaveBeenCalledWith(
      { collection: 'userVotes', id: 'poll-1_user-1' },
      expect.objectContaining({ pollId: 'poll-1', userId: 'user-1' }),
    )
  })

  it.each(['finalizado', 'não iniciado'] as const)(
    'rejects votes when the status is %s',
    async (status) => {
      const transaction = {
        get: jest.fn(async (reference: { collection: string }) =>
          reference.collection === 'polls'
            ? {
                exists: (): boolean => true,
                data: () => ({
                  status,
                  options: [{ id: 'option-1', text: 'Option 1', votes: 0 }],
                }),
              }
            : { exists: (): boolean => false },
        ),
        update: jest.fn(),
        set: jest.fn(),
      }
      jest.mocked(runTransaction).mockImplementation(
        async (_db, updateFunction) =>
          updateFunction(transaction as never),
      )

      await expect(
        voteOnPoll('poll-1', 'option-1', 'user-1'),
      ).rejects.toThrow('Esta enquete não está ativa no momento.')
      expect(transaction.update).not.toHaveBeenCalled()
      expect(transaction.set).not.toHaveBeenCalled()
    },
  )
})
