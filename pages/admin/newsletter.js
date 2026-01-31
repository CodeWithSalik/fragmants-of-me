import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";

export default function NewsletterPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Auth Check (Simplified for brevity, assumes AdminLayout handles some)
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

const handleSend = async (e) => {
  e.preventDefault();
  if (!subject.trim() || !message.trim()) return toast.error("Fill all fields");
  
  setSending(true);
  try {
    // 1. Fetch all user emails from Firestore
    const userSnap = await getDocs(collection(db, "users"));
    const emails = userSnap.docs.map(doc => doc.data().email).filter(Boolean);

    // 2. Call the Resend broadcast API
    await fetch("/api/newsletter-broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, recipients: emails }),
    });

    toast.success("Broadcast Sent via Resend!");
    setSubject(""); setMessage("");
  } catch (err) { 
    toast.error("Broadcast failed"); 
  } finally { 
    setSending(false); 
  }
};

  const insert = (tag) => setMessage(prev => prev + tag);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-serif font-bold text-ink mb-8">Newsletter Broadcast</h1>

        <div className="aura-card reading-mode">
          <div className="aura-card-content p-8">
            <form onSubmit={handleSend} className="space-y-6">
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Subject Line</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Weekly Fragments..." />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted block">HTML Content</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => insert("<h2>Title</h2>")} className="text-xs bg-black/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Title</button>
                    <button type="button" onClick={() => insert("<p>Text</p>")} className="text-xs bg-black/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Para</button>
                    <button type="button" onClick={() => insert('<a href="">Link</a>')} className="text-xs bg-black/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Link</button>
                  </div>
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="font-mono text-sm h-64" placeholder="<p>Dear Reader...</p>" />
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={sending} className="btn-primary px-8 py-3">
                  {sending ? "Broadcasting..." : "Send to All Users"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}