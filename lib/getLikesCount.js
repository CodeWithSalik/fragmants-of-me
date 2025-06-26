import { doc, collection, getCountFromServer } from "firebase/firestore";
import { db } from "./firebase";

export async function getLikesCount(entryId) {
  const entryRef = doc(db, "entries", entryId);
  const likesCol = collection(entryRef, "likes");
  const snap = await getCountFromServer(likesCol);
  return snap.data().count;
}
