import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore"; 
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";
import { FiEye, FiEdit3 } from "react-icons/fi";

export default function NewsletterPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // New State

  // Auth Check
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error("Fill all fields");
    
    setSending(true);
    try {
      const userSnap = await getDocs(collection(db, "users"));
      const emails = userSnap.docs.map(doc => doc.data().email).filter(Boolean);

      const res = await fetch("/api/newsletter-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, recipients: emails }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Broadcast failed");
      }

      toast.success("Broadcast Sent Successfully!");
      setSubject(""); 
      setMessage("");
      setPreviewMode(false);
    } catch (err) { 
      console.error(err);
      toast.error(err.message); 
    } finally { 
      setSending(false); 
    }
  };

  const insert = (tag) => setMessage(prev => prev + tag);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-ink">Newsletter Broadcast</h1>
          
          {/* TOGGLE BUTTONS */}
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button 
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${!previewMode ? "bg-white dark:bg-black text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <FiEdit3 /> Editor
            </button>
            <button 
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${previewMode ? "bg-white dark:bg-black text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <FiEye /> Preview
            </button>
          </div>
        </div>

        <div className="aura-card reading-mode">
          <div className="aura-card-content p-8">
            <form onSubmit={handleSend} className="space-y-6">
              
              {/* SUBJECT */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Subject Line</label>
                <input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="Weekly Fragmants..." 
                  className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              {/* EDITOR / PREVIEW AREA */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted block">Content</label>
                  
                  {/* Formatting Helpers (Only in Editor Mode) */}
                  {!previewMode && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => insert("<h2>Title</h2>")} className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Title</button>
                      <button type="button" onClick={() => insert("<p>Text</p>")} className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Para</button>
                      <button type="button" onClick={() => insert('<a href="">Link</a>')} className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Link</button>
                    </div>
                  )}
                </div>

                {previewMode ? (
                  // PREVIEW CONTAINER (Simulates Email Styling)
                  <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                    <div className="bg-gray-200 dark:bg-[#252525] px-4 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-gray-300 dark:border-white/5">
                      Email Preview
                    </div>
                    <div className="p-8 bg-white text-black min-h-[300px]">
                      {/* Exact Styling from API Template */}
                      <div style={{ fontFamily: 'Georgia, serif', color: '#2b2118', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#b45309', borderBottom: '1px solid #ddd', paddingBottom: '10px', fontSize: '24px', fontWeight: 'bold' }}>
                          Fragmants of Me
                        </h1>
                        <div 
                          style={{ margin: '20px 0', whiteSpace: 'pre-wrap' }} 
                          dangerouslySetInnerHTML={{ __html: message || "<p style='color:#ccc; font-style:italic;'>Start typing to see content...</p>" }} 
                        />
                        <hr style={{ border: '0', borderTop: '1px solid #eee', marginTop: '30px' }} />
                        <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                          A digital sanctuary for the unsaid.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // RAW EDITOR
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    className="font-mono text-sm h-96 w-full p-4 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-accent outline-none resize-none"
                    placeholder="<p>Dear Reader...</p>" 
                  />
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={sending} className="btn-primary px-8 py-3">
                  {sending ? "Broadcasting..." : "Send to All Users"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}