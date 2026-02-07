import { adminDb, authAdmin } from "@/lib/firebase-admin";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await authAdmin.verifyIdToken(token);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    if (userDoc.data()?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 1. Parallel Data Fetching
    const [
      usersSnap,
      entriesSnap,
      commentsSnap,
      viewsSnap,
      likesSnap,
      followersSnap, // <--- NEW: Count Global Followers
      topViewedSnap,
      recentCommentsSnap
    ] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("entries").get(), 
      adminDb.collectionGroup("comments").count().get(), 
      adminDb.collectionGroup("views").count().get(), 
      adminDb.collectionGroup("likes").count().get(),
      adminDb.collectionGroup("followers").count().get(), // <--- NEW QUERY
      adminDb.collection("entries").orderBy("views", "desc").limit(10).get(),
      adminDb.collectionGroup("comments").orderBy("timestamp", "desc").limit(5).get()
    ]);

    // 2. Process Entries Data
    let totalEntries = 0;
    let privateEntries = 0;
    let publicEntries = 0;

    entriesSnap.forEach(doc => {
      totalEntries++;
      if (doc.data().isPrivate) privateEntries++;
      else publicEntries++;
    });

    // 3. Format "Top Content" (Now includes Likes)
    const topContent = topViewedSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      views: doc.data().views || 0,
      likes: doc.data().likes || 0, // <--- Include Likes
      author: doc.data().authorName,
      type: doc.data().type,
      date: doc.data().timestamp?.toDate().toLocaleDateString() || "N/A"
    }));

    // 4. Format "Recent Activity"
    const recentActivity = recentCommentsSnap.docs.map(doc => ({
      id: doc.id,
      author: doc.data().authorName,
      content: doc.data().content,
      time: doc.data().timestamp?.toDate() || new Date(),
      entryId: doc.ref.parent.parent ? doc.ref.parent.parent.id : null 
    }));

    res.status(200).json({
      stats: {
        users: usersSnap.data().count,
        entries: totalEntries,
        private: privateEntries,
        public: publicEntries,
        comments: commentsSnap.data().count,
        views: viewsSnap.data().count,
        likes: likesSnap.data().count,
        followers: followersSnap.data().count // <--- Sent to frontend
      },
      topContent,
      recentActivity
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
}