import { transporter, mailOptions } from "@/lib/nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { name, email, message } = req.body;

  if (!email || !message) return res.status(400).json({ error: "Missing fields" });

  try {
    await transporter.sendMail({
      ...mailOptions,
      // CHANGE THIS LINE:
      to: process.env.RECIPIENT_EMAIL || "pirzadasalik543@gmail.com", 
      replyTo: email,
      subject: `Fragment Inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #b45309;">New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <hr />
          <p style="white-space: pre-wrap; font-size: 16px;">${message}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return res.status(500).json({ error: error.message });
  }
}