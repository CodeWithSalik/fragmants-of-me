import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("📩 Password reset email sent!");
    } catch (error) {
      toast.error("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <form
        onSubmit={handleReset}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md border border-amber"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-dark">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-6 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber hover:bg-amber-dark text-white font-semibold py-2 rounded transition-all"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </div>
  );
}
