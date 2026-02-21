"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";
import { handleGoogleRedirectResult } from "./auth";
import { findFamilyLink, ensureFamilyAccess } from "./family-service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** The UID to use for all data operations (meals, plans). May differ from user.uid if family-linked. */
  dataUid: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  dataUid: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataUid, setDataUid] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    // Handle redirect result from mobile Google sign-in
    handleGoogleRedirectResult().catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if this user is family-linked to another user's data
        try {
          const link = firebaseUser.email
            ? await findFamilyLink(firebaseUser.email)
            : null;
          if (link) {
            // Create access grant so Firestore rules allow this user to access owner's data
            await ensureFamilyAccess(link.ownerUid, firebaseUser.uid);
          }
          setDataUid(link ? link.ownerUid : firebaseUser.uid);
        } catch {
          // If lookup fails, fall back to own UID
          setDataUid(firebaseUser.uid);
        }
      } else {
        setDataUid(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, dataUid }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
