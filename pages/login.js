// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

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
      toast.success("✅ Logged in successfully!");
      router.push("/poems");
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md border border-amber"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-dark">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-amber hover:bg-amber-dark text-white font-semibold py-2 rounded transition-all"
          type="submit"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-4">
          New here?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-blue-600 underline cursor-pointer"
          >
            Register now
          </span>
        </p>
        <p className="text-sm text-center mt-3 text-blue-600 underline cursor-pointer"
          onClick={() => router.push("/forgot-password")}>
          Forgot Password?
        </p>

      </form>
    </div>
  );
}
