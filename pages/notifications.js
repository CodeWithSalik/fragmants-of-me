import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { FiBell, FiMessageSquare, FiFileText, FiUserPlus, FiTrash2, FiCheck, FiCornerDownRight } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [user, loading] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  // 1. Fetch Notifications
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50) // Load last 50
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  // 2. Mark Single as Read
  const handleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Mark All as Read
  const markAllRead = async () => {
    const batch = writeBatch(db);
    let count = 0;
    notifications.forEach(n => {
      if (!n.read) {
        const ref = doc(db, "users", user.uid, "notifications", n.id);
        batch.update(ref, { read: true });
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
      toast.success("All caught up");
    }
  };

  // 4. Clear All
  const clearAll = async () => {
    if (!confirm("Clear all notifications? This cannot be undone.")) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      const ref = doc(db, "users", user.uid, "notifications", n.id);
      batch.delete(ref);
    });
    await batch.commit();
    toast.success("Notifications cleared");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">Listening...</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl min-h-screen">
      <Head><title>Notifications | Fragments of Me</title></Head>

      <div className="flex items-center justify-between mb-8 border-b border-black/5 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <FiBell className="text-2xl text-accent" />
          <h1 className="text-3xl font-serif font-bold text-ink">Whispers</h1>
        </div>
        
        <div className="flex gap-4">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllRead} 
              className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent-strong flex items-center gap-2"
            >
              <FiCheck /> Mark Read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={clearAll} 
              className="text-xs font-bold uppercase tracking-widest text-muted hover:text-red-500 flex items-center gap-2"
            >
              <FiTrash2 /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-xl font-serif text-muted italic">Silence is a sound, too.</p>
            <p className="text-xs uppercase tracking-widest mt-2">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleRead(notif.id, notif.read)}
              className={`group relative p-6 rounded-2xl transition-all duration-300 border border-transparent 
                ${notif.read ? "bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10" : "bg-white dark:bg-black/20 shadow-lg border-accent/20"}
              `}
            >
              {!notif.read && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}

              <div className="flex gap-5">
                {/* --- ICON COLUMN --- */}
                <div className="shrink-0 mt-1">
                   {notif.type === "new_follower" && (
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 text-pink-500 flex items-center justify-center">
                      <FiUserPlus size={18} />
                    </div>
                  )}
                  {notif.type === "comment" && (
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                      <FiMessageSquare size={18} />
                    </div>
                  )}
                  {notif.type === "reply" && (
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                      <FiCornerDownRight size={18} />
                    </div>
                  )}
                  {notif.type === "new_post" && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                      <FiFileText size={18} />
                    </div>
                  )}
                </div>

                {/* --- CONTENT COLUMN --- */}
                <div className="flex-1">
                  
                  {/* TYPE: NEW FOLLOWER */}
                  {notif.type === "new_follower" && (
                    <Link href={`/author/${notif.followerId}`} className="block group-hover:translate-x-1 transition-transform">
                      <p className="text-ink text-lg font-serif">
                        <span className="font-bold">{notif.followerName}</span> started following you.
                      </p>
                      <p className="text-sm text-muted mt-1">
                        A new reader has joined your circle.
                      </p>
                    </Link>
                  )}

                  {/* TYPE: COMMENT */}
                  {notif.type === "comment" && (
                    <Link href={`/entry/${notif.entryId}`} className="block group-hover:translate-x-1 transition-transform">
                      <p className="text-ink text-lg font-serif">
                        <span className="font-bold">{notif.commenterName || "Someone"}</span> echoed on your fragment.
                      </p>
                      <div className="mt-2 pl-4 border-l-2 border-accent/30 italic text-muted text-sm line-clamp-2">
                        "{notif.content}"
                      </div>
                    </Link>
                  )}

                   {/* TYPE: REPLY */}
                   {notif.type === "reply" && (
                    <Link href={`/entry/${notif.entryId}`} className="block group-hover:translate-x-1 transition-transform">
                      <p className="text-ink text-lg font-serif">
                        <span className="font-bold">{notif.commenterName || "Someone"}</span> replied to your echo.
                      </p>
                      <div className="mt-2 pl-4 border-l-2 border-purple-400/30 italic text-muted text-sm line-clamp-2">
                        "{notif.content}"
                      </div>
                    </Link>
                  )}

                  {/* TYPE: NEW POST */}
                  {notif.type === "new_post" && (
                    <Link href={`/entry/${notif.entryId}`} className="block group-hover:translate-x-1 transition-transform">
                      <p className="text-ink text-lg font-serif">
                        <span className="font-bold">{notif.authorName}</span> published a new piece.
                      </p>
                      <p className="text-ink font-bold mt-1 text-xl">
                        {notif.title}
                      </p>
                    </Link>
                  )}

                  <p className="text-[10px] text-muted/40 uppercase tracking-widest mt-4">
                    {notif.createdAt?.toDate().toLocaleDateString()} • {notif.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}