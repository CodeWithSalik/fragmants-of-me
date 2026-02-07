import { transporter, mailOptions } from "@/lib/nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { name, email, testMode } = req.body;

  try {
    // --- TEST MODE LOGIC ---
    let recipientEmail = email;
    let subjectLine = "Welcome to the Circle of Authors";

    if (testMode) {
      console.log(`🚧 TEST MODE: Redirecting Author Approval email for ${email} to Admin.`);
      recipientEmail = "pirzadasalik543@gmail.com"; // YOUR EMAIL
      subjectLine = `[TEST MODE] Author Approved: ${name}`;
    }

    await transporter.sendMail({
      ...mailOptions,
      to: recipientEmail,
      subject: subjectLine,
      html: `
        <div style="font-family: 'Georgia', serif; color: #2b2118; padding: 40px 20px; max-width: 600px; margin: 0 auto; background-color: #faf9f6;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <span style="font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #888;">
              ${testMode ? "Test Notification" : "Fragmants of Me"}
            </span>
          </div>

          <div style="text-align: center;">
            <h1 style="font-size: 32px; margin: 0 0 15px 0; color: #1a1a1a; letter-spacing: -1px;">
              Your Voice is Heard.
            </h1>
            <div style="width: 40px; height: 1px; background-color: #b45309; margin: 0 auto 20px auto;"></div>
          </div>

          <div style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 30px;">
            <p>Dear ${name},</p>
            <p>
              We were moved by your writing. It is rare to find a voice that speaks so clearly in the quiet.
            </p>
            <p>
              We have upgraded your account to <strong>Author</strong> status. You now have the ability to compose and publish your own Fragmants—poems, monologues, diaries, and perspectives—directly to the collection.
            </p>
            <p>
              The page is blank, and it is waiting for you.
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
            <a href="https://Fragmants-of-me.vercel.app/write" 
               style="display: inline-block; background-color: #b45309; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 6px rgba(180, 83, 9, 0.2);">
              Start Writing
            </a>
          </div>

          <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 20px;">
            <p style="font-size: 10px; color: #999;">
              Welcome to the collective.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, mode: testMode ? "test" : "live" });
  } catch (error) {
    console.error("Author Approval Error:", error);
    return res.status(500).json({ error: error.message });
  }
}