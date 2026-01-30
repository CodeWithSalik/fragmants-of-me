import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mark as read on load
  useEffect(() => {
    if (!currentUser) return;
    const markRead = async () => {
      const snap = await getDocs(collection(db, "users", currentUser.uid, "notifications"));
      snap.docs.forEach(d => updateDoc(doc(db, "users", currentUser.uid, "notifications", d.id), { read: true }));
    };
    markRead();
  }, [currentUser]);

  // Load Notifications
  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      const followSnap = await getDocs(collection(db, "users", currentUser.uid, "following"));
      const authorIds = followSnap.docs.map(d => d.id);
      
      if (authorIds.length > 0) {
        const q = query(
          collection(db, "entries"),
          where("uid", "in", authorIds),
          orderBy("timestamp", "desc")
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      setLoading(false);
    };
    load();
  }, [currentUser]);

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center text-muted">Please login.</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="flex items-center gap-4 mb-10 border-b border-black/5 dark:border-white/5 pb-6">
        <FiBell className="text-3xl text-accent" />
        <h1 className="text-3xl font-serif font-bold text-ink">Notifications</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted">Checking...</p>
        ) : items.length === 0 ? (
          <p className="text-muted">No new echoes.</p>
        ) : (
          items.map((n, i) => (
            <Link key={n.id} href={`/entry/${n.id}`}>
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex justify-between items-center">
                  <div>
                    <p className="font-serif font-semibold text-lg text-ink mb-1 group-hover:text-accent transition-colors">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted uppercase tracking-widest">
                      New Post by {n.authorName}
                    </p>
                  </div>
                  <span className="text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    Read →
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}