import { collection, query, orderBy, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiBell, FiFileText } from "react-icons/fi";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadAndClearNotifications = async () => {
      try {
        // 1. Fetch Notifications Once (Snapshot)
        const q = query(
          collection(db, "users", currentUser.uid, "notifications"),
          orderBy("createdAt", "desc")
        );
        
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 2. Show them to the user (Persists in local RAM)
        setItems(data);
        setLoading(false);

        // 3. Auto-Delete from Database (Clean up immediately)
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((d) => {
            const ref = doc(db, "users", currentUser.uid, "notifications", d.id);
            batch.delete(ref);
          });
          
          // Execute delete in background
          await batch.commit().catch(e => console.error("Auto-clear failed", e));
        }

      } catch (err) {
        console.error("Notification Error:", err);
        setLoading(false);
      }
    };

    loadAndClearNotifications();
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted italic">No new echoes in the silence.</p>
          </div>
        ) : (
          items.map((n) => (
            <Link key={n.id} href={`/entry/${n.entryId}`}>
              <div className="group relative overflow-hidden rounded-xl border border-accent/30 bg-white dark:bg-white/10 p-5 shadow-sm transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/20">
                <div className="flex items-start gap-4">
                  
                  {/* Icon Badge */}
                  <div className="mt-1 p-2 rounded-full bg-accent text-white">
                    <FiFileText size={16} />
                  </div>

                  <div className="flex-1">
                    <p className="font-serif font-bold text-lg text-ink mb-1 group-hover:text-accent transition-colors">
                      {n.title}
                    </p>
                    <p className="text-sm text-muted">
                      <span className="font-bold text-ink">{n.authorName}</span> published a new fragment.
                    </p>
                    <p className="text-[10px] text-muted/60 uppercase tracking-widest mt-2">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : "Just now"}
                    </p>
                  </div>

                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}