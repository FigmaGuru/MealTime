import { db } from "./config";
import { collection } from "firebase/firestore";

export function userMealsRef(uid: string) {
  if (!db) throw new Error("Firebase not initialized");
  return collection(db, "users", uid, "meals");
}

export function userPlansRef(uid: string) {
  if (!db) throw new Error("Firebase not initialized");
  return collection(db, "users", uid, "plans");
}
