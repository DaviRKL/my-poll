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
  const [pollError, setPollError] = useState<Error | null>(null);
  const [voteStatusError, setVoteStatusError] = useState<Error | null>(null);

  // 1. Escuta a enquete em tempo real (RF5)
  useEffect(() => {
    const unsubscribe = listenToPoll(pollId, (updatedPoll) => {
      setPoll(updatedPoll);
      setLoading(false);
      setPollError(null);
    }, (listenError) => {
      console.error(listenError);
      setPollError(listenError);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pollId]);

  // 2. Verifica se o usuário autenticado já votou nesta enquete
  useEffect(() => {
    let active = true;

    const checkVoteStatus = async () => {
      if (user && pollId) {
        try {
          const voted = await checkUserHasVoted(pollId, user.uid);
          if (active) {
            setHasVoted(voted);
            setVoteStatusError(null);
          }
        } catch (voteStatusError) {
          console.error(voteStatusError);
          if (active) {
            setVoteStatusError(
              voteStatusError instanceof Error
                ? voteStatusError
                : new Error("Não foi possível verificar seu voto."),
            );
          }
        }
      }
    };

    checkVoteStatus();
    return () => {
      active = false;
    };
  }, [user, pollId]);

  // 3. RN6: A fonte da verdade para bloquear a UI é o status do Firestore
  const isVotingActive =
    poll?.status === "iniciado" || poll?.status === "em andamento";

  const handleVote = async (optionId: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    if (!poll) throw new Error("Enquete não carregada.");

    // Trava de segurança no clique, caso o botão tenha sido burlado via DevTools
    if (!isVotingActive) {
      throw new Error("Esta enquete não está ativa no momento.");
    }

    if (hasVoted) {
      throw new Error("Você já votou nesta enquete.");
    }

    await voteOnPoll(pollId, optionId, user.uid);
    setHasVoted(true);
  };

  return {
    poll,
    loading,
    error: pollError ?? (user ? voteStatusError : null),
    hasVoted,
    handleVote,
    isVotingActive, // Use isso no 'disabled' do seu <button> e dos seus <input type="radio">
  };
};
