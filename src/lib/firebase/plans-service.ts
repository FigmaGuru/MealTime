import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./config";
import type { WeeklyPlan, DayPlan } from "@/types";

function requireDb() {
  if (!db) throw new Error("Firebase not initialized");
  return db;
}

export async function createOrUpdatePlan(
  uid: string,
  weekStartISO: string,
  days: DayPlan[]
) {
  if (!weekStartISO?.trim()) {
    throw new Error("weekStartISO is required for createOrUpdatePlan");
  }
  const planDoc = doc(requireDb(), "users", uid, "plans", weekStartISO);
  await setDoc(
    planDoc,
    {
      weekStartISO,
      days,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    },
    { merge: true }
  );
}

export function subscribePlan(
  uid: string,
  weekStartISO: string,
  callback: (plan: WeeklyPlan | null) => void
): () => void {
  if (!weekStartISO?.trim()) {
    callback(null);
    return () => {};
  }
  const planDoc = doc(requireDb(), "users", uid, "plans", weekStartISO);
  return onSnapshot(planDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as WeeklyPlan);
    } else {
      callback(null);
    }
  });
}
