import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AuthorRequests() {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const snap = await getDocs(collection(db, "authorRequests"));
    setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status === "pending"));
  };

  useEffect(() => { load(); }, []);

  const handleDecision = async (req, status) => {
    await updateDoc(doc(db, "authorRequests", req.id), { status, reviewedAt: serverTimestamp() });
    
    if (status === "approved") {
      await updateDoc(doc(db, "users", req.uid), { role: "author" });
      await setDoc(doc(db, "authors", req.uid), { name: req.name, bio: req.bio, joinedAt: serverTimestamp() });
      toast.success("Author Approved");
    } else {
      toast.success("Request Rejected");
    }
    load();
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-serif font-bold text-ink mb-8">Pending Applications</h1>

        {requests.length === 0 ? (
          <p className="text-muted italic">No pending requests at this moment.</p>
        ) : (
          <div className="grid gap-6">
            {requests.map(r => (
              <div key={r.id} className="aura-card reading-mode">
                <div className="aura-card-content p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    <div className="space-y-3 flex-grow">
                      <div>
                        <h2 className="text-xl font-bold text-ink">{r.name}</h2>
                        <p className="text-xs text-muted uppercase tracking-widest">{r.email}</p>
                      </div>
                      
                      <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5">
                        <p className="text-xs font-bold text-accent mb-1">BIO</p>
                        <p className="text-sm italic mb-4">{r.bio}</p>
                        
                        <p className="text-xs font-bold text-accent mb-1">SAMPLE</p>
                        <p className="text-sm font-serif leading-relaxed opacity-80 whitespace-pre-wrap">{r.sample}</p>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 justify-center min-w-[120px]">
                      <button onClick={() => handleDecision(r, "approved")} className="btn-primary bg-green-600 hover:bg-green-700 text-white w-full py-2 text-xs">
                        Approve
                      </button>
                      <button onClick={() => handleDecision(r, "rejected")} className="px-4 py-2 rounded-full border border-red-500 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition">
                        Reject
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}