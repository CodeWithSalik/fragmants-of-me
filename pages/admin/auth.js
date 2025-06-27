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
    const verified = sessionStorage.getItem("admin_pin_verified") === "true";
    if (verified) router.push("/admin");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ref = doc(db, "settings", "adminPin");
      const snap = await getDoc(ref);
      const correctPin = snap.data()?.pin;

      if (pin === correctPin) {
        sessionStorage.setItem("admin_pin_verified", "true");
        toast.success("✅ PIN verified");
        router.push("/admin");
      } else {
        toast.error("❌ Incorrect PIN");
      }
    } catch (err) {
      toast.error("Failed to verify PIN");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user)
    return <p className="p-6 text-green-400 font-mono bg-black min-h-screen">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center px-4 font-mono">
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] border border-green-500 p-8 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="text-xl font-bold mb-6 text-amber-400 text-center tracking-wider">
          🛡️ Admin PIN Required
        </h2>
        <input
          type="password"
          placeholder="Enter secure PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full bg-black text-green-300 border border-green-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-400 mb-6"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded transition"
        >
          {submitting ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
