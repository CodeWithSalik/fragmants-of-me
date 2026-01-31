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
        content="We were moved by your writing sample. Your account has been upgraded to 'Author' status. You can now compose and publish your own fragments." 
      />
    );

    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: "You are now an Author",
      html: htmlContent,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Author Approval Error:", error);
    return res.status(500).json({ error: error.message });
  }
}