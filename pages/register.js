import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for Admin Whitelist
      const adminRef = doc(db, "settings", "admins");
      const adminSnap = await getDoc(adminRef);
      const adminEmails = adminSnap.exists() ? adminSnap.data().emails || [] : [];

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const role = adminEmails.includes(email) ? "admin" : "user";

      await setDoc(doc(db, "users", userCred.user.uid), {
        name, mobile, email, role, createdAt: new Date(),
      });

      await updateProfile(userCred.user, { displayName: name });

      // Send Welcome Email (Backend Hook)
      try {
        await fetch("https://newyear-backend.onrender.com/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
      } catch (err) { console.error("Email failed", err); }

      toast.success("Account created.");
      router.push("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="aura-card w-full max-w-md reading-mode">
        <div className="aura-card-content p-8 md:p-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-ink mb-2">Join Us</h1>
            <p className="text-muted text-sm">Become part of the story.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="text" placeholder="Mobile Number" className="w-full" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <input type="email" placeholder="Email" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-bold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}