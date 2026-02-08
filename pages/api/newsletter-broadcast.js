import { transporter, mailOptions } from "@/lib/nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { subject, message, recipients, testMode, testEmail } = req.body;

  // 1. Determine Target Audience
  let finalRecipients = [];
  let isTest = false;

  if (testMode) {
    // --- TEST MODE LOGIC ---
    if (!testEmail) {
      return res.status(400).json({ error: "Test mode requires a 'testEmail' address." });
    }
    finalRecipients = [testEmail];
    isTest = true;
    console.log(`🧪 TEST MODE: Sending preview to ${testEmail}`);
  } else {
    // --- BROADCAST LOGIC ---
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      console.error("❌ Broadcast Error: 'recipients' list is empty.");
      return res.status(400).json({ error: "No recipients found." });
    }
    finalRecipients = recipients;
    console.log(`📧 BROADCAST: Attempting to send to ${recipients.length} recipients...`);
  }

  // 2. Smart HTML Handling
  // If the message is a full HTML template (like your System Update), send it RAW.
  // If it's just a paragraph text, wrap it in the default container.
  const isFullTemplate = message.trim().startsWith("<!DOCTYPE") || message.trim().startsWith("<html");

  const finalHtml = isFullTemplate ? message : `
    <div style="font-family: 'Georgia', serif; color: #2b2118; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #b45309; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Fragmants of Me</h1>
      <div style="margin: 20px 0; white-space: pre-wrap;">${message}</div>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        A digital sanctuary for the unsaid.
      </p>
    </div>
  `;

  try {
    // 3. Send Mail
    await transporter.sendMail({
      ...mailOptions,
      // Use 'to' for single test (better deliverability), 'bcc' for mass broadcast (privacy)
      to: isTest ? finalRecipients : undefined, 
      bcc: isTest ? undefined : finalRecipients, 
      subject: isTest ? `[TEST] ${subject}` : subject,
      html: finalHtml,
    });

    console.log(isTest ? "✅ Test email sent." : "✅ Broadcast sent successfully.");
    return res.status(200).json({ success: true, testMode: isTest });

  } catch (err) {
    console.error("❌ Nodemailer Error:", err); 
    return res.status(500).json({ error: err.message || "Email server failed" });
  }
}