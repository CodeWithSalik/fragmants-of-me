import { adminDb, authAdmin } from "@/lib/firebase-admin"; 
import { transporter, mailOptions } from "@/lib/nodemailer";
import { FieldValue } from "firebase-admin/firestore"; 

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // --- 🔒 SECURITY CHECK START ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    
    // Verify user is Author or Admin
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const role = userDoc.data()?.role;
    if (role !== "admin" && role !== "author") {
       return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
  // --- 🔒 SECURITY CHECK END ---

  const { title, authorName, entryId, authorId, testMode, type, snippet } = req.body;

  try {
    console.log("📢 Starting 'Notify All' Broadcast...");
    if (testMode) console.log("🚧 TEST MODE ACTIVE: Only notifying Admin.");

    let users = [];

    if (testMode) {
      users = [
        { 
          uid: "test-admin-uid", 
          email: "pirzadasalik543@gmail.com", 
          fcmToken: null 
        }
      ];
    } else {
      const usersSnap = await adminDb.collection("users").get();
      if (usersSnap.empty) {
        return res.status(200).json({ message: "No users to notify." });
      }
      users = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }

    // 1. In-App Notifications
    if (!testMode) {
      const batch = adminDb.batch();
      let batchCount = 0;
      
      users.forEach(u => {
        if (u.uid === authorId) return;

        const ref = adminDb.collection("users").doc(u.uid).collection("notifications").doc();
        batch.set(ref, {
          type: "new_post",
          title,
          authorName,
          entryId,
          createdAt: FieldValue.serverTimestamp(),
          read: false
        });
        batchCount++;
      });

      if (batchCount > 0) await batch.commit();
    }

    // 2. Emails
    const emails = users
      .map(u => u.email)
      .filter(e => e && e.includes("@"));

    if (emails.length > 0) {
      console.log(`📧 Sending email to ${emails.length} recipients...`);
      
      const subjectPrefix = testMode ? "[TEST] " : "";
      const displayType = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Fragment";
      
      const formattedSnippet = snippet 
        ? snippet.replace(/\n/g, "<br/>") 
        : "A new story has been written...";

      await transporter.sendMail({
        ...mailOptions,
        bcc: emails,
        subject: `${subjectPrefix}New ${displayType}: "${title}"`,
        html: `
          <div style="font-family: 'Georgia', serif; color: #2b2118; padding: 40px 20px; max-width: 600px; margin: 0 auto; background-color: #faf9f6;">
            
            <div style="text-align: center; border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; margin-bottom: 30px;">
              <span style="font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #888;">
                Fragmants of Me
              </span>
            </div>

            <div style="text-align: center;">
              <p style="font-size: 12px; color: #b45309; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 10px;">
                New ${displayType}
              </p>
              <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #1a1a1a; letter-spacing: -0.5px;">
                ${title}
              </h1>
              <p style="font-size: 14px; color: #666; font-style: italic;">
                by ${authorName}
              </p>
            </div>

            <div style="background: #fff; padding: 30px; margin: 30px 0; border-left: 3px solid #b45309; font-size: 16px; line-height: 1.8; color: #444; font-style: italic;">
              "${formattedSnippet}"
            </div>

            <div style="text-align: center; margin-top: 40px;">
              <a href="https://Fragmants-of-me.vercel.app/entry/${entryId}" 
                 style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                Read Full Fragment
              </a>
            </div>

            <div style="text-align: center; margin-top: 50px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
              <p style="font-size: 10px; color: #999;">
                You are receiving this because you subscribed to Fragmants of Me.
              </p>
            </div>
          </div>
        `,
      });
      console.log("✅ Emails sent.");
    }

    return res.status(200).json({ success: true, count: users.length, mode: testMode ? "test" : "live" });

  } catch (error) {
    console.error("❌ Notify All Error:", error);
    return res.status(500).json({ error: error.message });
  }
}