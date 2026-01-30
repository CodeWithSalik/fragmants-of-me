import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent. Check your inbox.");
    } catch (error) {
      toast.error("Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="aura-card w-full max-w-md reading-mode">
        <div className="aura-card-content p-8 md:p-10 text-center">
          
          <h1 className="text-2xl font-serif font-bold text-ink mb-2">Reset Access</h1>
          <p className="text-muted text-sm mb-8">Enter your email to recover your account.</p>

          <form onSubmit={handleReset} className="space-y-6">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-8">
            <Link href="/login" className="text-xs text-accent font-bold uppercase tracking-widest hover:underline">
              Return to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}