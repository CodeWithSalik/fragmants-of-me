// lib/admin/unpinComment.js
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function unpinComment(entryId, commentId) {
  const pinId = `${entryId}_${commentId}`;
  await deleteDoc(doc(db, "pinnedComments", pinId));
}
