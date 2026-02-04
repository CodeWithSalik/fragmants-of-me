import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Starting export...");

    const snapshot = await getDocs(collection(db, "entries"));

    console.log("Docs found:", snapshot.size);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error("🔥 EXPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to export entries"
    });
  }
}
