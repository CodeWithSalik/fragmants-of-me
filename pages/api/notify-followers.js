import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { transporter, mailOptions } from "@/lib/nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { authorId, authorName, title, entryId } = req.body;

  try {
    // 1. Get all follower IDs from the author's subcollection
    const followersRef = collection(db, "authors", authorId, "followers");
    const followersSnap = await getDocs(followersRef);
    
    if (followersSnap.empty) {
      return res.status(200).json({ message: "No followers to notify" });
    }

    const followerIds = followersSnap.docs.map(doc => doc.id);

    // 2. Fetch email addresses for these IDs from the 'users' collection
    // Note: Firestore 'in' query supports max 10 items. For simplicity/scale, we loop asynchronously here.
    const emailPromises = followerIds.map(async (uid) => {
      const userSnap = await getDoc(doc(db, "users", uid));
      return userSnap.exists() ? userSnap.data().email : null;
    });

    const results = await Promise.all(emailPromises);
    const validEmails = results.filter(email => email); // Remove nulls

    if (validEmails.length === 0) {
      return res.status(200).json({ message: "No valid emails found for followers" });
    }

    // 3. Send the Email via BCC (Blind Carbon Copy) to protect privacy
    await transporter.sendMail({
      ...mailOptions,
      bcc: validEmails, 
      subject: `New Fragment from ${authorName}: "${title}"`,
      html: `
        <div style="font-family: 'Georgia', serif; color: #2b2118; padding: 20px; max-width: 600px;">
          <h2 style="color: #b45309; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
            New Post by ${authorName}
          </h2>
          <p style="font-size: 16px; margin-top: 20px;">
            "${title}" has just been published.
          </p>
          <div style="margin-top: 30px;">
            <a href="https://Fragmants-of-me.vercel.app/entry/${entryId}" 
               style="background-color: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Read Fragment
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
          <p style="font-size: 12px; color: #888;">
            You are receiving this because you follow ${authorName} on Fragmants of Me.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, count: validEmails.length });

  } catch (error) {
    console.error("Notify Followers Error:", error);
    return res.status(500).json({ error: error.message });
  }
}