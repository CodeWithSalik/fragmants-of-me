import {
  collection,
  getDocs,
  getCountFromServer,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAnalytics() {
  try {
    const entriesSnap = await getDocs(collection(db, "entries"));
    const usersSnap = await getDocs(collection(db, "users"));

    const entryDocs = entriesSnap.docs;

    let totalComments = 0;
    let totalLikes = 0;
    let totalViews = 0;

    // Loop through each entry and aggregate subcollection counts
    for (const entry of entryDocs) {
      const entryId = entry.id;

      const commentsSnap = await getCountFromServer(
        collection(db, "entries", entryId, "comments")
      );
      totalComments += commentsSnap.data().count || 0;

      const likesSnap = await getCountFromServer(
        collection(db, "entries", entryId, "likes")
      );
      totalLikes += likesSnap.data().count || 0;

      const viewsSnap = await getCountFromServer(
        collection(db, "entries", entryId, "views")
      );
      totalViews += viewsSnap.data().count || 0;
    }

    return {
      users: usersSnap.size || 0,
      entries: entryDocs.length || 0,
      comments: totalComments,
      likes: totalLikes,
      views: totalViews,
    };
  } catch (err) {
    console.error("getAnalytics error:", err);
    return {
      users: 0,
      entries: 0,
      comments: 0,
      likes: 0,
      views: 0,
    };
  }
}
