import { transporter, mailOptions } from "@/lib/nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { subject, message, recipients } = req.body;

  try {
    // Send using BCC to protect privacy
    await transporter.sendMail({
      ...mailOptions,
      bcc: recipients, 
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

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Broadcast Error:", err);
    return res.status(500).json({ error: "Broadcast failed" });
  }
}