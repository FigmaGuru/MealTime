import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { userMealsRef } from "./firestore";
import type { Meal, CreateMealInput } from "@/types";

function requireDb() {
  if (!db) throw new Error("Firebase not initialized");
  return db;
}

/** Firestore rejects `undefined` values — strip them before writing. */
function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

export async function createMeal(
  uid: string,
  data: CreateMealInput
): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(userMealsRef(uid), stripUndefined({
    ...data,
    createdAt: now,
    updatedAt: now,
  }));
  return docRef.id;
}

export async function updateMeal(
  uid: string,
  mealId: string,
  data: Partial<Meal>
) {
  const mealDoc = doc(requireDb(), "users", uid, "meals", mealId);
  await updateDoc(mealDoc, stripUndefined({ ...data, updatedAt: Date.now() }));
}

export async function deleteMeal(uid: string, mealId: string) {
  const mealDoc = doc(requireDb(), "users", uid, "meals", mealId);
  await deleteDoc(mealDoc);
}

export async function bulkCreateMeals(
  uid: string,
  meals: CreateMealInput[]
): Promise<number> {
  const batch = writeBatch(requireDb());
  const now = Date.now();
  const ref = userMealsRef(uid);

  for (const meal of meals) {
    const newDocRef = doc(ref);
    batch.set(newDocRef, stripUndefined({
      ...meal,
      createdAt: now,
      updatedAt: now,
    }));
  }

  await batch.commit();
  return meals.length;
}

export function subscribeMeals(
  uid: string,
  callback: (meals: Meal[]) => void
): () => void {
  const q = query(userMealsRef(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const meals = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Meal[];
    callback(meals);
  });
}
