import { doc, collection, getCountFromServer } from "firebase/firestore";
import { db } from "./firebase";

export async function getViewsCount(entryId) {
  const entryRef = doc(db, "entries", entryId);
  const viewsCol = collection(entryRef, "views");
  const snap = await getCountFromServer(viewsCol);
  return snap.data().count;
}
