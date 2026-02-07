import { adminDb, authAdmin } from "@/lib/firebase-admin";

export default async function handler(req, res) {
  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    await authAdmin.verifyIdToken(token);
    
    // 2. SYNC ENTRIES (Views & Likes)
    console.log("🔄 Starting Entry Sync...");
    const entriesSnap = await adminDb.collection("entries").get();
    let batch = adminDb.batch();
    let counter = 0;
    let updatedEntries = 0;

    for (const doc of entriesSnap.docs) {
      const viewsSnap = await doc.ref.collection("views").count().get();
      const likesSnap = await doc.ref.collection("likes").count().get();
      
      batch.update(doc.ref, { 
        views: viewsSnap.data().count,
        likes: likesSnap.data().count 
      });

      counter++;
      updatedEntries++;
      if (counter >= 400) { await batch.commit(); batch = adminDb.batch(); counter = 0; }
    }
    if (counter > 0) await batch.commit();

    // 3. SYNC AUTHORS (Followers)
    console.log("🔄 Starting Author Sync...");
    const authorsSnap = await adminDb.collection("users").where("role", "==", "author").get();
    batch = adminDb.batch();
    counter = 0;
    let updatedAuthors = 0;

    for (const doc of authorsSnap.docs) {
      // Assuming followers are in subcollection 'followers' or 'following' logic
      // Standard: users/{authorId}/followers
      // Or authors/{authorId}/followers if using separate collection
      
      // Let's check 'users/{id}/followers' first
      const followersSnap = await doc.ref.collection("followers").count().get();
      
      batch.update(doc.ref, { 
        followerCount: followersSnap.data().count 
      });

      counter++;
      updatedAuthors++;
      if (counter >= 400) { await batch.commit(); batch = adminDb.batch(); counter = 0; }
    }
    if (counter > 0) await batch.commit();

    console.log(`✅ Synced ${updatedEntries} entries & ${updatedAuthors} authors.`);
    return res.status(200).json({ success: true, updatedEntries, updatedAuthors });

  } catch (error) {
    console.error("Sync Error:", error);
    return res.status(500).json({ error: error.message });
  }
}