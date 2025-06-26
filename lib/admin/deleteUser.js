// lib/admin/deleteUser.js
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function deleteUser(uid) {
  await deleteDoc(doc(db, "users", uid));
}
