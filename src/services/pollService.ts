import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Poll, PollStatus } from "../types";
import {
  incrementPollOptionVotes,
  normalizePollOptions,
} from "../utils/normalizePollOptions";
import {
  getPollStatusAfterVote,
  isPollVotingActive,
  isPollStatus,
} from "../utils/pollStatus";

const POLLS_COLLECTION = "polls";
const VOTES_COLLECTION = "userVotes";

// RF1 e RN5: Criar enquete validando mínimo de 3 opções
export const createPoll = async (
  pollData: Omit<Poll, "id">,
): Promise<string> => {
  if (pollData.options.length < 3) {
    throw new Error("A enquete deve ter no mínimo 3 opções.");
  }

  const docRef = await addDoc(collection(db, POLLS_COLLECTION), {
    ...pollData,
    startDate:
      pollData.startDate instanceof Date
        ? Timestamp.fromDate(pollData.startDate)
        : pollData.startDate,
    endDate:
      pollData.endDate instanceof Date
        ? Timestamp.fromDate(pollData.endDate)
        : pollData.endDate,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
};

// RF2 e RF3: Listar enquetes (com filtro opcional por status)
export const getPolls = async (
  statusFilter: PollStatus | "" = "",
): Promise<Poll[]> => {
  const pollsRef = collection(db, POLLS_COLLECTION);
  let q = query(pollsRef, orderBy("createdAt", "desc"));

  if (statusFilter !== "") {
    q = query(pollsRef, where("status", "==", statusFilter));
  }

  const snapshot = await getDocs(q);
  const polls = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Poll[];

  if (statusFilter !== "") {
    polls.sort((a, b) => {
      const aCreatedAt =
        a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.toMillis();
      const bCreatedAt =
        b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.toMillis();
      return bCreatedAt - aCreatedAt;
    });
  }

  return polls;
};

// RF5: Escutar uma enquete específica em tempo real (Realtime Votes)
export const listenToPoll = (
  pollId: string,
  callback: (poll: Poll) => void,
  onError: (error: Error) => void,
) => {
  const pollRef = doc(db, POLLS_COLLECTION, pollId);

  return onSnapshot(pollRef, (docSnap) => {
    if (docSnap.exists()) {
      try {
        const data = docSnap.data();
        callback({
          ...data,
          id: docSnap.id,
          options: normalizePollOptions(data.options),
        } as Poll);
      } catch (error) {
        onError(
          error instanceof Error
            ? error
            : new Error("Não foi possível interpretar os dados da enquete."),
        );
      }
    }
  }, onError);
};

// Controle de Voto: Evita duplo voto e atualiza a contagem atomicamente
export const voteOnPoll = async (
  pollId: string,
  optionId: string,
  userId: string,
): Promise<void> => {
  const voteRef = doc(db, VOTES_COLLECTION, `${pollId}_${userId}`);
  const pollRef = doc(db, POLLS_COLLECTION, pollId);

  await runTransaction(db, async (transaction) => {
    const [pollSnapshot, voteSnapshot] = await Promise.all([
      transaction.get(pollRef),
      transaction.get(voteRef),
    ]);

    if (!pollSnapshot.exists()) {
      throw new Error("Enquete não encontrada.");
    }

    if (voteSnapshot.exists()) {
      throw new Error("Você já votou nesta enquete.");
    }

    const pollData = pollSnapshot.data();
    if (!isPollStatus(pollData.status) || !isPollVotingActive(pollData.status)) {
      throw new Error("Esta enquete não está ativa no momento.");
    }

    const pollOptions = normalizePollOptions(pollData.options);

    transaction.update(pollRef, {
      options: incrementPollOptionVotes(pollOptions, optionId),
      status: getPollStatusAfterVote(pollData.status),
    });

    transaction.set(voteRef, {
      pollId,
      optionId,
      userId,
      votedAt: Timestamp.now(),
    });
  });
};

export const checkUserHasVoted = async (
  pollId: string,
  userId: string,
): Promise<boolean> => {
  const voteRef = doc(db, VOTES_COLLECTION, `${pollId}_${userId}`);
  const voteSnap = await getDoc(voteRef);
  return voteSnap.exists();
};
