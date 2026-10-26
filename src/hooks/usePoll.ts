import { useState, useEffect } from "react";
import {
  listenToPoll,
  voteOnPoll,
  checkUserHasVoted,
} from "../services/pollService";
import type { Poll } from "../types";
import { useAuth } from "./useAuth";

export const usePoll = (pollId: string) => {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  // 1. Escuta a enquete em tempo real (RF5)
  useEffect(() => {
    const unsubscribe = listenToPoll(pollId, (updatedPoll) => {
      setPoll(updatedPoll);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pollId]);

  // 2. Verifica se o usuário autenticado já votou nesta enquete
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (user && pollId) {
        const voted = await checkUserHasVoted(pollId, user.uid);
        setHasVoted(voted);
      }
    };
    checkVoteStatus();
  }, [user, pollId]);

  // 3. RN6: A fonte da verdade para bloquear a UI é o status do Firestore
  const isVotingActive =
    poll?.status === "iniciado" || poll?.status === "em andamento";

  const handleVote = async (optionId: string, optionIndex: number) => {
    if (!user) throw new Error("Usuário não autenticado.");
    if (!poll) throw new Error("Enquete não carregada.");

    // Trava de segurança no clique, caso o botão tenha sido burlado via DevTools
    if (!isVotingActive) {
      throw new Error("Esta enquete não está ativa no momento.");
    }

    if (hasVoted) {
      throw new Error("Você já votou nesta enquete.");
    }

    await voteOnPoll(pollId, optionId, user.uid, optionIndex);
    setHasVoted(true);
  };

  return {
    poll,
    loading,
    hasVoted,
    handleVote,
    isVotingActive, // Use isso no 'disabled' do seu <button> e dos seus <input type="radio">
  };
};
