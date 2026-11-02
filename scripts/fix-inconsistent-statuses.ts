import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, writeBatch } from 'firebase/firestore';

// Substitua pelas variáveis do seu .env ou credenciais do Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface PollDocument {
  title: string;
  status: string;
  options: Option[];
}

async function fixInconsistentPollStatuses() {
  console.log("🔍 Buscando enquetes com status 'iniciado'...");

  const pollsRef = collection(db, 'polls');
  const q = query(pollsRef, where('status', '==', 'iniciado'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("✅ Nenhuma enquete com status 'iniciado' foi encontrada.");
    return;
  }

  const batch = writeBatch(db);
  let updatedCount = 0;

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data() as PollDocument;
    
    // Calcula o total de votos computados nas opções da enquete
    const totalVotes = data.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

    if (totalVotes > 0) {
      console.log(`📌 Enquete "${data.title}" (ID: ${docSnap.id}) possui ${totalVotes} voto(s). Alterando status para 'em andamento'...`);
      const pollDocRef = doc(db, 'polls', docSnap.id);
      batch.update(pollDocRef, { status: 'em andamento' });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`🎉 Correção concluída com sucesso! ${updatedCount} enquete(s) atualizada(s) para 'em andamento'.`);
  } else {
    console.log("ℹ️ Nenhuma enquete 'iniciada' possuía votos registrados. Nenhuma alteração foi necessária.");
  }
}

fixInconsistentPollStatuses().catch(console.error);