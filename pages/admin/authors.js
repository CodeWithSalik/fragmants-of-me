import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, serverTimestamp, setDoc, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout"; // Ensure this path is correct for your project
import { FiCheck, FiX, FiMail } from "react-icons/fi";

export default function AuthorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Test Mode State
  const [isTestMode, setIsTestMode] = useState(false);

  const loadRequests = async () => {
    try {
      const q = query(collection(db, "authorRequests"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleDecision = async (req, status) => {
    if (!confirm(`Are you sure you want to ${status} ${req.penName}?`)) return;

    try {
      // 1. Update Request Status
      await updateDoc(doc(db, "authorRequests", req.id), { 
        status, 
        reviewedAt: serverTimestamp() 
      });
      
      if (status === "approved") {
        // 2. Grant Author Role
        await updateDoc(doc(db, "users", req.uid), { role: "author" });
        
        // 3. Create Public Author Profile
        await setDoc(doc(db, "authors", req.uid), { 
          name: req.penName, 
          bio: req.bio, 
          joinedAt: serverTimestamp(),
          email: req.email
        });

        // 4. Send Welcome Email (With Test Mode Flag)
        fetch("/api/author-approved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: req.penName,
            email: req.email,
            testMode: isTestMode // <--- SEND FLAG
          })
        });

        toast.success(isTestMode ? "✅ Approved & Test Email Sent" : "✅ Approved & Email Sent");
      } else {
        toast.error("Application Rejected");
      }

      // Refresh List
      loadRequests();

    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-4">
          <h1 className="text-3xl font-serif font-bold text-ink">Pending Applications</h1>
          
          {/* TEST MODE TOGGLE */}
          <label className="flex items-center gap-2 cursor-pointer bg-yellow-100 dark:bg-yellow-900/20 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-700">
            <input 
              type="checkbox" 
              checked={isTestMode} 
              onChange={() => setIsTestMode(!isTestMode)} 
              className="w-4 h-4 accent-yellow-600"
            />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">
              Test Mode
            </span>
          </label>
        </div>

        {loading ? (
          <div className="text-muted italic">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-black/5 dark:bg-white/5 rounded-xl">
            <p className="text-muted italic">No pending requests at this moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map(req => (
              <div key={req.id} className="aura-card reading-mode">
                <div className="aura-card-content p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-xl font-bold text-ink">{req.penName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <FiMail /> {req.email}
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-black/5">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Bio</p>
                        <p className="text-sm text-ink/80">{req.bio}</p>
                      </div>

                      <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-black/5">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Writing Sample</p>
                        <p className="font-serif text-ink italic leading-relaxed whitespace-pre-wrap">"{req.sample}"</p>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 justify-start min-w-[140px]">
                      <button 
                        onClick={() => handleDecision(req, "approved")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm uppercase tracking-wide"
                      >
                        <FiCheck size={18} /> Approve
                      </button>
                      
                      <button 
                        onClick={() => handleDecision(req, "rejected")}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm uppercase tracking-wide"
                      >
                        <FiX size={18} /> Reject
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