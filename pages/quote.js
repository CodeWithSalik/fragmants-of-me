// pages/admin/quote.js
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { checkIfAdmin } from "@/lib/checkAdmin";

export default function EditQuote() {
  const [user, loading] = useAuthState(auth);
  const [quote, setQuote] = useState("");
  const [isAdmin, setIsAdmin] = useState(null); // null means "still checking"
  const router = useRouter();

  // Check if the logged-in user is admin
  useEffect(() => {
    if (user?.uid) {
      checkIfAdmin(user.uid).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && isAdmin === false) {
      router.push("/");
    }

    if (!loading && user && isAdmin) {
      const fetchQuote = async () => {
        const ref = doc(db, "settings", "quoteOfTheDay");
        const snap = await getDoc(ref);
        if (snap.exists()) setQuote(snap.data().text);
      };
      fetchQuote();
    }
  }, [user, loading, isAdmin]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "settings", "quoteOfTheDay"), {
        text: quote,
        updatedAt: new Date(),
      });
      toast.success("✅ Quote updated!");
    } catch (err) {
      toast.error("❌ Error saving quote");
    }
  };

  if (loading || isAdmin === null) return <p className="p-10">Verifying access...</p>;

  if (!user || !isAdmin) return null; // prevent flash

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-xl font-bold mb-4">Edit Quote of the Day</h1>
      <textarea
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        rows={4}
        className="w-full p-3 border rounded mb-4"
      />
      <button
        onClick={handleSave}
        className="bg-amber text-white px-4 py-2 rounded hover:bg-amber-dark transition"
      >
        Save Quote
      </button>
    </div>
  );
}
