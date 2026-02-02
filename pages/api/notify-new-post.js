import { adminDb } from "@/lib/firebase-admin"; // Use the Admin DB
import { transporter, mailOptions } from "@/lib/nodemailer";
import { FieldValue } from "firebase-admin/firestore"; // Admin SDK syntax differs slightly

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { title, authorName, entryId, authorId } = req.body;

  try {
    console.log("📢 Starting 'Notify All' Broadcast...");

    // 1. Fetch ALL Users using Admin SDK (Bypasses Rules)
    const usersSnap = await adminDb.collection("users").get();
    
    if (usersSnap.empty) {
      console.log("⚠️ No users found.");
      return res.status(200).json({ message: "No users to notify." });
    }

    const users = usersSnap.docs.map(doc => ({ uid: doc.id, email: doc.data().email }));
    console.log(`✅ Found ${users.length} users.`);

    // 2. Prepare In-App Notifications (Batch Write)
    const batch = adminDb.batch();
    let batchCount = 0;
    
    users.forEach(u => {
      // Don't notify the author themselves
      if (u.uid === authorId) return;

      const ref = adminDb.collection("users").doc(u.uid).collection("notifications").doc();
      batch.set(ref, {
        type: "new_post",
        title,
        authorName,
        entryId,
        createdAt: FieldValue.serverTimestamp(), // Admin SDK uses FieldValue
        read: false
      });
      batchCount++;
    });

    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Queued ${batchCount} in-app notifications.`);
    }

    // 3. Prepare Emails
    const emails = users
      .map(u => u.email)
      .filter(e => e && e.includes("@")); // Basic validation

    if (emails.length > 0) {
      console.log(`📧 Sending email to ${emails.length} recipients...`);
      await transporter.sendMail({
        ...mailOptions,
        bcc: emails, // Use BCC to notify everyone privately
        subject: `New Fragment: "${title}"`,
        html: `
          <div style="font-family: 'Georgia', serif; color: #2b2118; padding: 20px; max-width: 600px;">
            <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px;">
              New Publication
            </p>
            <h2 style="color: #b45309; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-top: 10px;">
              ${title}
            </h2>
            <p style="font-size: 16px; line-height: 1.6;">
              <strong>${authorName}</strong> has just published a new fragment to the collection.
            </p>
            <div style="margin-top: 30px;">
              <a href="https://fragmants-of-me.vercel.app/entry/${entryId}" 
                 style="background-color: #2b2118; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                Read Fragment
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
            <p style="font-size: 11px; color: #aaa;">
              You are receiving this because you are a member of Fragments of Me.
            </p>
          </div>
        `,
      });
      console.log("✅ Emails sent.");
    }

    return res.status(200).json({ success: true, count: users.length });

  } catch (error) {
    console.error("❌ Notify All Error:", error);
    return res.status(500).json({ error: error.message });
  }
}