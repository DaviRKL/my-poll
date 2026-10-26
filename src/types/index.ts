import { Timestamp } from "firebase/firestore";

export type PollStatus =
  "não iniciado" | "iniciado" | "em andamento" | "finalizado";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id?: string; // Opcional antes de persistir no Firestore
  title: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  status: PollStatus;
  options: PollOption[];
  createdBy: string; // UID do Google ou Auth Anônimo
  createdAt: Timestamp | Date;
}

export interface UserVote {
  pollId: string;
  optionId: string;
  userId: string;
  votedAt: Timestamp | Date;
}
