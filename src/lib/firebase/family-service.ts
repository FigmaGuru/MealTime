import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config";

export interface FamilyLink {
  id: string;
  ownerUid: string;
  ownerEmail: string;
  memberEmail: string;
  createdAt: number;
}

function requireDb() {
  if (!db) throw new Error("Firebase not initialized");
  return db;
}

function familyLinksRef() {
  return collection(requireDb(), "family-links");
}

/** Find the owner UID this email is linked to (if any). */
export async function findFamilyLink(
  memberEmail: string
): Promise<{ ownerUid: string } | null> {
  const q = query(
    familyLinksRef(),
    where("memberEmail", "==", memberEmail.toLowerCase().trim())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return { ownerUid: data.ownerUid as string };
}

/**
 * Create a family-access grant so Firestore rules allow the member
 * to read/write the owner's data. Document ID: `{ownerUid}_{memberUid}`.
 */
export async function ensureFamilyAccess(
  ownerUid: string,
  memberUid: string
) {
  const accessDoc = doc(requireDb(), "family-access", `${ownerUid}_${memberUid}`);
  await setDoc(accessDoc, { ownerUid, memberUid, createdAt: Date.now() }, { merge: true });
}

/** Create a family link so memberEmail shares ownerUid's data. */
export async function createFamilyLink(
  ownerUid: string,
  ownerEmail: string,
  memberEmail: string
): Promise<string> {
  const docRef = await addDoc(familyLinksRef(), {
    ownerUid,
    ownerEmail: ownerEmail.toLowerCase().trim(),
    memberEmail: memberEmail.toLowerCase().trim(),
    createdAt: Date.now(),
  });
  return docRef.id;
}

/** Remove a family link by document ID. */
export async function removeFamilyLink(linkId: string) {
  await deleteDoc(doc(requireDb(), "family-links", linkId));
}

/** Subscribe to all family links where this user is the owner. */
export function subscribeFamilyLinks(
  ownerUid: string,
  callback: (links: FamilyLink[]) => void
): () => void {
  const q = query(familyLinksRef(), where("ownerUid", "==", ownerUid));
  return onSnapshot(q, (snap) => {
    const links = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as FamilyLink[];
    callback(links);
  });
}
