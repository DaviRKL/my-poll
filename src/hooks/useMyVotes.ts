import { useCallback, useEffect, useState } from 'react'
import {
  getUserVotedPolls,
  type VotedPoll,
} from '../services/pollService'

export function useMyVotes(userId: string | null) {
  const [votedPolls, setVotedPolls] = useState<VotedPoll[]>([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState<string | null>(null)

  const fetchVotes = useCallback(async () => {
    if (!userId) {
      setVotedPolls([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    try {
      setVotedPolls(await getUserVotedPolls(userId))
      setError(null)
    } catch (fetchError) {
      console.error(fetchError)
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Erro ao buscar seus votos.',
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchVotes()
  }, [fetchVotes])

  return { votedPolls, loading, error, refetch: fetchVotes }
}
