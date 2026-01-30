import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";

export default function EditEntry() {
  const router = useRouter();
  const { id } = router.query;
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form State
  const [entry, setEntry] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("diary");
  const [timestamp, setTimestamp] = useState(new Date());
  const [authorName, setAuthorName] = useState("");
  const [mood, setMood] = useState("warm");

  // Admin Check
  useEffect(() => {
    if (user?.uid) checkIfAdmin(user.uid).then(setIsAdmin);
  }, [user]);

  // Load Data
  useEffect(() => {
    // FIX: Remove 'isAdmin' from this check so it runs for everyone
    if (!id || !user) return; 

    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, "entries", id));
        if (snap.exists()) {
          const data = snap.data();
          
          // SECURITY CHECK: Must be Admin OR Owner
          if (!isAdmin && data.uid !== user.uid) {
             toast.error("Unauthorized access.");
             router.push("/");
             return;
          }

          setEntry(data);
          setTitle(data.title);
          setContent(data.content);
          setType(data.type);
          setMood(data.mood || "warm");
          setAuthorName(data.authorName);
          setTimestamp(data.timestamp?.toDate() || new Date());
        } else {
          toast.error("Entry not found.");
          router.push("/");
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Only run when we know admin status or just run it and let the internal check handle it
    // Adding a small delay or dependency on isAdmin helps prevent flashing "unauthorized"
    if (!loading) fetchData();

  }, [id, user, isAdmin, loading, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Fill all fields");
    
    await updateDoc(doc(db, "entries", id), { title, content, type, timestamp, authorName, mood });
    toast.success("Saved Changes");
    router.push(`/entry/${id}`);
  };

  if (loading || !entry) return <div className="p-10 text-center text-muted">Loading editor...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="aura-card reading-mode">
        <div className="aura-card-content p-8 md:p-12">
          
          <div className="flex justify-between items-center mb-8 border-b border-black/5 dark:border-white/5 pb-4">
            <h1 className="text-3xl font-serif font-bold text-ink">Edit Fragment</h1>
            {entry.isPrivate && <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-bold">PRIVATE</span>}
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="font-serif text-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="poem">Poem</option>
                  <option value="diary">Diary</option>
                  <option value="monologue">Monologue</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Mood</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)}>
                  <option value="warm">Warm</option>
                  <option value="soft">Soft</option>
                  <option value="melancholic">Melancholic</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Author</label>
                <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Date</label>
                <DatePicker selected={timestamp} onChange={(d) => setTimestamp(d)} className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="h-64 font-serif text-lg leading-relaxed" />
            </div>

            <div className="flex justify-end pt-6">
              <button type="submit" className="btn-primary px-8 py-3">Save Changes</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}