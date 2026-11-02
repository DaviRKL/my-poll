import { useState, useEffect, useCallback } from "react";
import { getUserPolls } from "../services/pollService";
import type { Poll } from "../types";

export const useMyPolls = (userId: string | null) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    if (!userId) {
      setPolls([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setPolls(await getUserPolls(userId));
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Erro ao buscar suas enquetes.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPolls();
  }, [fetchPolls]);

  return { polls, loading, error, refetch: fetchPolls };
};
