import { auth, db } from "./config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error("Firebase not initialized");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  if (!auth || !db) throw new Error("Firebase not initialized");
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(credential.user, { displayName });
  await setDoc(doc(db, "users", credential.user.uid), {
    displayName,
    email,
    createdAt: Date.now(),
  });
  return credential;
}

export async function signInWithGoogle() {
  if (!auth || !db) throw new Error("Firebase not initialized");
  const credential = await signInWithPopup(auth, googleProvider);
  const userDoc = doc(db, "users", credential.user.uid);
  await setDoc(
    userDoc,
    {
      displayName: credential.user.displayName ?? "",
      email: credential.user.email ?? "",
      createdAt: Date.now(),
    },
    { merge: true }
  );
  return credential;
}

export async function logOut() {
  if (!auth) return;
  return signOut(auth);
}

export async function updateUserProfile(displayName: string) {
  if (!auth || !db) throw new Error("Firebase not initialized");
  if (!auth.currentUser) throw new Error("Not authenticated");
  await updateProfile(auth.currentUser, { displayName });
  await setDoc(
    doc(db, "users", auth.currentUser.uid),
    { displayName, updatedAt: Date.now() },
    { merge: true }
  );
}
