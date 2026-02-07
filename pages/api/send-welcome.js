import { transporter, mailOptions } from "@/lib/nodemailer";
import { EmailTemplate } from "@/components/EmailTemplate";
import { renderToStaticMarkup } from "react-dom/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { name, email } = req.body;

  try {
    const htmlContent = renderToStaticMarkup(
      <EmailTemplate 
        name={name} 
        content="Thank you for joining our circle. Your account is now active. We hope you find peace in these Fragmants." 
      />
    );

    // Await is critical for Vercel/Cloud functions
    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: `Welcome to Fragmants, ${name}`,
      html: htmlContent,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Welcome Email Error:", error);
    return res.status(500).json({ error: error.message });
  }
}