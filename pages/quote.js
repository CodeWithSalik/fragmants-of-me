import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { checkIfAdmin } from "@/lib/checkAdmin";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EditQuote() {
  const [user, loading] = useAuthState(auth);
  const [quote, setQuote] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) checkIfAdmin(user.uid).then(setIsAdmin);
    else setIsAdmin(false);
  }, [user]);

  useEffect(() => {
    if (!loading && isAdmin === false) router.push("/");
    if (!loading && user && isAdmin) {
      getDoc(doc(db, "settings", "quoteOfTheDay")).then(snap => {
        if (snap.exists()) setQuote(snap.data().text);
      });
    }
  }, [user, loading, isAdmin, router]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "settings", "quoteOfTheDay"), { text: quote, updatedAt: new Date() });
      toast.success("Quote updated successfully");
    } catch (err) { toast.error("Error saving quote"); }
  };

  if (loading || !isAdmin) return <div className="p-10 text-center text-muted">Verifying...</div>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="aura-card reading-mode">
          <div className="aura-card-content p-8 md:p-12">
            
            <h1 className="text-2xl font-serif font-bold text-ink mb-6">Daily Quote</h1>
            
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={4}
              placeholder="Type something inspiring..."
              className="w-full text-lg font-serif mb-6 h-40"
            />
            
            <div className="flex justify-end">
              <button onClick={handleSave} className="btn-primary px-6 py-2">
                Update Homepage
              </button>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}