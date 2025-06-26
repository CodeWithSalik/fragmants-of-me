// lib/admin/promoteToAdmin.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function promoteToAdmin(uid, role = "admin") {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { role });
}
