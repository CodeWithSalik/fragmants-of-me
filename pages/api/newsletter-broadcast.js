import { transporter, mailOptions } from "@/lib/nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { subject, message, recipients } = req.body;

  // 1. Validation Logging
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.error("❌ Broadcast Error: 'recipients' list is empty or invalid.");
    return res.status(400).json({ error: "No recipients found. Check if you have users in the database." });
  }

  try {
    console.log(`📧 Attempting to send to ${recipients.length} recipients...`);

    // 2. Send Mail
    await transporter.sendMail({
      ...mailOptions,
      bcc: recipients, // Use BCC to hide emails from each other
      subject: subject,
      html: `<div style="font-family: 'Georgia', serif; color: #2b2118; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b45309; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Fragments of Me</h1>
        <div style="margin: 20px 0; white-space: pre-wrap;">${message}</div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          A digital sanctuary for the unsaid.
        </p>
      </div>`,
    });

    console.log("✅ Broadcast sent successfully.");
    return res.status(200).json({ success: true });

  } catch (err) {
    // 3. Log the REAL error
    console.error("❌ Nodemailer Error:", err); 
    
    // Return the specific error message to the frontend
    return res.status(500).json({ error: err.message || "Email server failed" });
  }
}