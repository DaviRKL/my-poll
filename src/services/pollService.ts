import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  increment,
  writeBatch,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Poll, PollStatus } from "../types";

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
    q = query(
      pollsRef,
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc"),
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Poll[];
};

// RF5: Escutar uma enquete específica em tempo real (Realtime Votes)
export const listenToPoll = (
  pollId: string,
  callback: (poll: Poll) => void,
) => {
  const pollRef = doc(db, POLLS_COLLECTION, pollId);

  return onSnapshot(pollRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Poll);
    }
  });
};

// Controle de Voto: Evita duplo voto e atualiza a contagem atomicamente
export const voteOnPoll = async (
  pollId: string,
  optionId: string,
  userId: string,
  optionIndex: number,
): Promise<void> => {
  const voteRef = doc(db, VOTES_COLLECTION, `${pollId}_${userId}`);
  const pollRef = doc(db, POLLS_COLLECTION, pollId);

  const batch = writeBatch(db);

  // 1. Registra que o usuário votou nesta enquete (usando merge ou set para falhar se já existir via Security Rules)
  batch.set(voteRef, {
    pollId,
    optionId,
    userId,
    votedAt: Timestamp.now(),
  });

  // 2. Incrementa atomicamente a opção específica dentro do array
  // Como o Firestore não permite incrementar um campo de objeto dentro de um array diretamente,
  // precisamos conhecer o índice da opção ou modelar as opções como um mapa (Object) em vez de Array.
  // Modelagem como Array exige substituição completa ou uso de Mapas.

  // Abordagem com estruturação em Mapa (Recomendada para realtime via dot notation):
  // { [`options.${optionId}.votes`]: increment(1) }

  batch.update(pollRef, {
    [`options.${optionIndex}.votes`]: increment(1),
  });

  await batch.commit();
};

export const checkUserHasVoted = async (
  pollId: string,
  userId: string,
): Promise<boolean> => {

  const voteSnap = await getDocs(
    query(
      collection(db, VOTES_COLLECTION),
      where("pollId", "==", pollId),
      where("userId", "==", userId),
    ),
  );
  return !voteSnap.empty;
};
