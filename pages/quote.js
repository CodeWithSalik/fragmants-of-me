// pages/admin/quote.js
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function EditQuote() {
  const [user, loading] = useAuthState(auth);
  const [quote, setQuote] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.uid !== "SIpfZSIJM5RKrvLahp7I4DLwiE93")) {
      router.push("/");
    } else {
      const fetchQuote = async () => {
        const ref = doc(db, "settings", "quoteOfTheDay");
        const snap = await getDoc(ref);
        if (snap.exists()) setQuote(snap.data().text);
      };
      fetchQuote();
    }
  }, [user, loading]);

  const handleSave = async () => {
    await setDoc(doc(db, "settings", "quoteOfTheDay"), {
      text: quote,
      updatedAt: new Date(),
    });
    toast.success("Quote updated!");
  };

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
