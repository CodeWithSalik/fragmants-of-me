import { useState } from "react";
import toast from "react-hot-toast";
import Head from "next/head";

export default function Contact() {
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/contact-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: msg }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Echo received. We will respond shortly.");
      setMsg("");
      setName("");
      setEmail("");
    } catch (err) {
      toast.error("Could not send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Head><title>Contact | Fragmants of Me</title></Head>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-ink">Reach Out</h1>
        <p className="text-muted italic">Queries, feedback, or just a hello.</p>
      </div>

      <div className="aura-card reading-mode">
        <form onSubmit={send} className="aura-card-content p-10 space-y-6">
          <input 
            type="text" 
            placeholder="Name" 
            required 
            className="w-full bg-transparent border-b border-black/10 p-2 outline-none focus:border-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email" 
            required 
            className="w-full bg-transparent border-b border-black/10 p-2 outline-none focus:border-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea 
            placeholder="Your message..." 
            className="w-full h-32 bg-transparent border-b border-black/10 p-2 outline-none focus:border-accent resize-none"
            value={msg} 
            onChange={(e) => setMsg(e.target.value)} 
            required 
          />
          <button 
            disabled={sending}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}