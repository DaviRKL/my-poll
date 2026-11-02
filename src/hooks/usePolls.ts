import { useState, useEffect, useCallback } from "react";
import { getPolls, createPoll } from "../services/pollService";
import type { Poll, PollStatus } from "../types";

export const usePolls = (
  statusFilter: PollStatus | "" = "",
  enabled = true,
) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    if (!enabled) {
      setPolls([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const data = await getPolls(statusFilter);
      setPolls(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Erro ao buscar enquetes.",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, enabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPolls();
  }, [fetchPolls]);

  const addPoll = async (pollData: Omit<Poll, "id">) => {
    await createPoll(pollData);
    await fetchPolls(); // Atualiza a lista automaticamente após criar
  };

  return { polls, loading, error, addPoll, refetch: fetchPolls };
};
