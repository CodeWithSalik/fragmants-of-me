// lib/admin/sendNewsletter.js
export async function sendNewsletter(subject, messageHtml) {
    const res = await fetch("https://newyear-backend.onrender.com/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            subject,
            message: messageHtml,
            testMode: false // 👈 switch to false for production
        }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send newsletter");
    }

    return data;
}
