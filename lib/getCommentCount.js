import { doc, collection, getCountFromServer } from "firebase/firestore";
import { db } from "./firebase";

export async function getCommentCount(entryId) {
  try {
    const entryRef = doc(db, "entries", entryId);
    const commentsCol = collection(entryRef, "comments");
    const snapshot = await getCountFromServer(commentsCol);
    return snapshot.data().count;
  } catch (err) {
    console.error("Error fetching comment count:", err);
    return 0;
  }
}
