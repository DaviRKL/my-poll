import {
  getInitialPollStatus,
  getPollStatusAfterVote,
  isPollStatus,
  isPollVotingActive,
} from './pollStatus'

describe('poll status lifecycle', () => {
  const now = new Date('2026-10-31T12:00:00')

  it('marks a scheduled poll as not started', () => {
    expect(
      getInitialPollStatus(
        new Date('2026-11-01T12:00:00'),
        new Date('2026-11-08T12:00:00'),
        now,
      ),
    ).toBe('não iniciado')
  })

  it('marks a current poll with no votes as started', () => {
    expect(
      getInitialPollStatus(
        new Date('2026-10-30T12:00:00'),
        new Date('2026-11-08T12:00:00'),
        now,
      ),
    ).toBe('iniciado')
  })

  it('marks an expired poll as finished', () => {
    expect(
      getInitialPollStatus(
        new Date('2026-10-20T12:00:00'),
        new Date('2026-10-30T12:00:00'),
        now,
      ),
    ).toBe('finalizado')
  })

  it('allows voting while started and in progress, but not in other states', () => {
    expect(isPollVotingActive('iniciado')).toBe(true)
    expect(isPollVotingActive('em andamento')).toBe(true)
    expect(isPollVotingActive('não iniciado')).toBe(false)
    expect(isPollVotingActive('finalizado')).toBe(false)
  })

  it('recognizes all supported persisted statuses', () => {
    expect(isPollStatus('iniciado')).toBe(true)
    expect(isPollStatus('em andamento')).toBe(true)
    expect(isPollStatus('invalid')).toBe(false)
  })

  it('moves a started poll to in progress after its first vote', () => {
    expect(getPollStatusAfterVote('iniciado')).toBe('em andamento')
    expect(getPollStatusAfterVote('em andamento')).toBe('em andamento')
  })
})
