import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

export default function WritePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("poem");
  const [authorName, setAuthorName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState("warm");

  const router = useRouter();

  // AUTH CHECK: Only Admins & Authors
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }

      const snap = await getDoc(doc(db, "users", u.uid));
      const role = snap.data()?.role;

      if (role !== "admin" && role !== "author") {
        toast.error("You must be an Author to write.");
        router.push("/");
        return;
      }

      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName) return toast.error("Please fill all fields.");

    try {
      const entryRef = await addDoc(collection(db, "entries"), {
        title: title.trim(),
        content: content.trim(),
        type,
        isPrivate,
        timestamp: selectedDate,
        uid: user.uid,
        authorName,
        mood
      });

      // Notify Followers (Simplified for brevity)
      const followersSnap = await getDocs(collection(db, "authors", user.uid, "followers"));
      followersSnap.docs.forEach(async (f) => {
        await addDoc(collection(db, "users", f.id, "notifications"), {
          type: "new_post", authorId: user.uid, entryId: entryRef.id, title, createdAt: serverTimestamp(), read: false
        });
      });

      toast.success("✅ Published successfully!");
      router.push(`/entry/${entryRef.id}`);
    } catch (err) {
      toast.error("Failed to publish");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">Verifying credentials...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Premium Paper Container */}
      <div className="aura-card reading-mode">
        <div className="aura-card-content p-8 md:p-12">
          
          <h1 className="text-3xl font-serif font-bold text-ink mb-8 border-b border-black/5 dark:border-white/5 pb-4">
            Compose Fragment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Title</label>
              <input 
                placeholder="Name your fragment..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="text-lg font-serif"
              />
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
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Author Name</label>
                <input 
                  placeholder="Pen Name" 
                  value={authorName} 
                  onChange={(e) => setAuthorName(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Date</label>
                <DatePicker 
                  selected={selectedDate} 
                  onChange={(d) => setSelectedDate(d)} 
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Content</label>
              <textarea 
                placeholder="Write your heart out..." 
                className="h-64 font-serif text-lg leading-relaxed" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isPrivate} 
                  onChange={() => setIsPrivate(!isPrivate)} 
                  className="w-5 h-5 accent-accent"
                />
                <span className="text-sm font-medium text-muted group-hover:text-ink transition-colors">Mark as Private</span>
              </label>

              <button type="submit" className="btn-primary px-8 py-3 text-sm">
                Publish Entry
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}