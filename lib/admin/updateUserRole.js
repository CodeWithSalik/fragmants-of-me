import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function updateUserRole(uid, role) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { role });
}
