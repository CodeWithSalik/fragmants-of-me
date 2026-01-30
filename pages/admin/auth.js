import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminAuth() {
  const [user, loading] = useAuthState(auth);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("admin_pin_verified") === "true") router.push("/admin");
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const snap = await getDoc(doc(db, "settings", "adminPin"));
      if (pin === snap.data()?.pin) {
        sessionStorage.setItem("admin_pin_verified", "true");
        toast.success("Access Granted");
        router.push("/admin");
      } else {
        toast.error("Incorrect PIN");
      }
    } catch (err) { toast.error("Verification failed"); } 
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted">Verifying identity...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="aura-card reading-mode w-full max-w-sm">
        <div className="aura-card-content p-10 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-2xl font-serif font-bold text-ink mb-2">Admin Access</h1>
          <p className="text-muted text-sm mb-8">Security PIN Required</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter PIN" 
              className="text-center tracking-[0.5em] font-bold text-xl" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              autoFocus
            />
            <button disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? "Checking..." : "Unlock Panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}