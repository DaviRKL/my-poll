import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { app } from "../config/firebase"; // Instância do Firebase inicializada

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é um listener em tempo real do Firebase para a sessão
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
    }
  };

  const loginAnon = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Erro no login anônimo:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, loginWithGoogle, loginAnon, logout };
};
