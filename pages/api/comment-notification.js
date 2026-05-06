import { transporter, mailOptions } from "@/lib/nodemailer";
import { authAdmin } from "@/lib/firebase-admin"; 

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  // --- 🔒 SECURITY CHECK START ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    await authAdmin.verifyIdToken(token);
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token" });
  }
  // --- 🔒 SECURITY CHECK END ---

  const { targetEmail, targetName, commenterName, content, type, entryId, entryTitle, testMode } = req.body;

  if (!targetEmail || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let recipientEmail = targetEmail;
    let subjectPrefix = "";

    if (testMode) {
      console.log(`🚧 TEST MODE: Redirecting Comment Notification for ${targetEmail} to Admin.`);
      recipientEmail = "pirzadasalik543@gmail.com"; 
      subjectPrefix = "[TEST MODE] ";
    }

    const isReply = type === "reply";
    const subject = `${subjectPrefix}${isReply ? `${commenterName} replied to you` : `New Echo on "${entryTitle || 'your fragment'}"`}`;

    const titleText = isReply ? "New Reply" : "New Echo";
    const subText = isReply 
      ? `<strong>${commenterName}</strong> replied to your comment on <em>"${entryTitle}"</em>`
      : `<strong>${commenterName}</strong> left a thought on <em>"${entryTitle}"</em>`;

    const formattedContent = content.replace(/\n/g, "<br/>");

    await transporter.sendMail({
      ...mailOptions,
      to: recipientEmail,
      subject: subject,
      html: `
        <div style="font-family: 'Georgia', serif; color: #2b2118; padding: 40px 20px; max-width: 600px; margin: 0 auto; background-color: #faf9f6;">
          
          <div style="text-align: center; border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; margin-bottom: 30px;">
            <span style="font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #888;">
              ${testMode ? "Test Notification" : "Fragmants of Me"}
            </span>
          </div>

          <div style="text-align: center;">
            <p style="font-size: 12px; color: #b45309; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 10px;">
              ${titleText}
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a;">
              ${subText}
            </p>
          </div>

          <div style="background: #fff; padding: 25px; margin: 30px 0; border-left: 3px solid #b45309; font-size: 15px; line-height: 1.6; color: #444; font-style: italic; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            "${formattedContent}"
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://fragmants-of-me.vercel.app/entry/${entryId}#comments-section" 
               style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              ${isReply ? "Reply Back" : "View Discussion"}
            </a>
          </div>

          <div style="text-align: center; margin-top: 50px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
            <p style="font-size: 10px; color: #999;">
              You received this because you are part of the conversation.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, mode: testMode ? "test" : "live" });
  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(200).json({ success: false, error: error.message });
  }
}