// lib/admin/pinComment.js
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function pinComment(entryId, commentId) {
  const ref = doc(db, "entries", entryId, "comments", commentId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Comment not found");

  const data = snap.data();

  await setDoc(doc(db, "pinnedComments", `${entryId}_${commentId}`), {
    entryId,
    commentId,
    ...data,
    pinnedAt: new Date(),
  });
}
