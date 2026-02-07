import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

export default function WritePage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("poem");
  const [authorName, setAuthorName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState("warm");
  
  // Test Mode State
  const [isTestMode, setIsTestMode] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }

      const snap = await getDoc(doc(db, "users", u.uid));
      const userRole = snap.data()?.role;

      if (userRole !== "admin" && userRole !== "author") {
        toast.error("You must be an Author to write.");
        router.push("/");
        return;
      }

      setUser(u);
      setRole(userRole);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName) return toast.error("Please fill all fields.");

    try {
      // 1. Get Token (CRITICAL FOR SECURITY)
      const token = await user.getIdToken();

      // 2. Create Entry
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

      // 3. Generate Snippet
      const rawSnippet = content.trim().slice(0, 300); 
      const snippet = rawSnippet + (content.length > 300 ? "..." : "");

      // 4. Trigger Notification (With Token)
      fetch("/api/notify-new-post", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <--- Sending Token
        },
        body: JSON.stringify({
          title,
          authorName,
          type,
          snippet,
          entryId: entryRef.id,
          authorId: user.uid,
          testMode: isTestMode
        })
      });

      toast.success(isTestMode ? "✅ Published in Test Mode" : "✅ Published & Notified All!");
      router.push(`/entry/${entryRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">Verifying credentials...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
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
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 font-serif"
                >
                  <option value="poem">Poem</option>
                  <option value="diary">Diary</option>
                  <option value="monologue">Monologue</option>
                  <option value="perspective">Perspectives</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Mood</label>
                <select 
                  value={mood} 
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 font-serif"
                >
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
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isPrivate} 
                    onChange={() => setIsPrivate(!isPrivate)} 
                    className="w-5 h-5 accent-accent"
                  />
                  <span className="text-sm font-medium text-muted group-hover:text-ink transition-colors">Mark as Private</span>
                </label>

                {role === "admin" && (
                  <label className="flex items-center gap-2 cursor-pointer group bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-700">
                    <input 
                      type="checkbox" 
                      checked={isTestMode} 
                      onChange={() => setIsTestMode(!isTestMode)} 
                      className="w-4 h-4 accent-yellow-600"
                    />
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">Test Mode</span>
                  </label>
                )}
              </div>

              <button type="submit" className="btn-primary px-8 py-3 text-sm">
                {isTestMode ? "Publish & Test Notify" : "Publish Entry"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}