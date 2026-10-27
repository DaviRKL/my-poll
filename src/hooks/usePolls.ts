import { useState, useEffect, useCallback } from "react";
import { getPolls, createPoll } from "../services/pollService";
import type { Poll, PollStatus } from "../types";

export const usePolls = (statusFilter: PollStatus | "" = "") => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPolls(statusFilter);
      setPolls(data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar enquetes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPolls();
  }, [fetchPolls]);

  const addPoll = async (pollData: Omit<Poll, "id">) => {
    await createPoll(pollData);
    await fetchPolls(); // Atualiza a lista automaticamente após criar
  };

  return { polls, loading, error, addPoll, refetch: fetchPolls };
};
