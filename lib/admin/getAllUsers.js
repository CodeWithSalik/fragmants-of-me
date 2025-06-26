// lib/admin/getAllUsers.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}
