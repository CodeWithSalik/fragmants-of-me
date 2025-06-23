// pages/api/send-welcome.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { name, email, mobile } = req.body;

  try {
    // Replace this with your actual backend email logic
    await fetch("https://newyear-backend.onrender.com/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `Welcome to Fragments of Me, ${name}!`,
        message: `Dear ${name},\n\nThank you for joining. Your mobile: ${mobile}.\n\n– Pirzada Salik`,
      }),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
