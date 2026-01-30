import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back.");
      router.push("/");
    } catch (err) {
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="aura-card w-full max-w-md reading-mode">
        <div className="aura-card-content p-8 md:p-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-ink mb-2">Login</h1>
            <p className="text-muted text-sm">Enter the quiet space.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={loading}
              className="btn-primary w-full py-3 mt-4"
              type="submit"
            >
              {loading ? "Opening..." : "Enter"}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-muted">
              New here?{" "}
              <Link href="/register" className="text-accent font-bold hover:underline">
                Create an account
              </Link>
            </p>
            <p>
              <Link href="/forgot-password" className="text-xs text-muted/60 hover:text-ink transition-colors">
                Forgot Password?
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}