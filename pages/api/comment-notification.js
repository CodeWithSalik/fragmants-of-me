import { transporter, mailOptions } from "@/lib/nodemailer";
import { EmailTemplate } from "@/components/EmailTemplate";
import { renderToStaticMarkup } from "react-dom/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { targetEmail, targetName, commenterName, content, type } = req.body;

  if (!targetEmail || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const subject = type === "reply" 
      ? `${commenterName} replied to your echo` 
      : `New echo on your fragment from ${commenterName}`;

    const htmlContent = renderToStaticMarkup(
      <EmailTemplate 
        name={targetName || "Reader"} 
        content={`"${content}" — ${commenterName} just left a new ${type} on your work.`} 
      />
    );

    await transporter.sendMail({
      ...mailOptions,
      to: targetEmail,
      subject: subject,
      html: htmlContent,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Notification Error:", error);
    // Return 200 to keep UI valid even if mail fails
    return res.status(200).json({ success: false, error: error.message });
  }
}