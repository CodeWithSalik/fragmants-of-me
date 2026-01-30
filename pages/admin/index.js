import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  getCountFromServer,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/router";
import { getLikesCount } from "@/lib/getLikesCount";
import { getViewsCount } from "@/lib/getViewsCount";
import {
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiFileText,
  FiLock,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";

/* ====================================================== */

export default function AdminDashboard() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    private: 0,
    comments: 0,
    likes: 0,
    views: 0,
  });

  const [loadingData, setLoadingData] = useState(true);

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    if (loading) return;
    if (!user) return router.push("/");

    const verify = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.data()?.role !== "admin") return router.push("/");
      setIsAdmin(true);
    };

    verify();
  }, [user, loading, router]);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "entries"),
          orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        let stats = { total: 0, private: 0, comments: 0, likes: 0, views: 0 };
        const data = [];

        for (const d of snapshot.docs) {
          const entry = { id: d.id, ...d.data() };

          const commentsSnap = await getCountFromServer(
            collection(db, "entries", entry.id, "comments")
          );

          entry.commentCount = commentsSnap.data().count;
          entry.likeCount = await getLikesCount(entry.id);
          entry.viewCount = await getViewsCount(entry.id);

          stats.total++;
          if (entry.isPrivate) stats.private++;
          stats.comments += entry.commentCount;
          stats.likes += entry.likeCount;
          stats.views += entry.viewCount;

          data.push(entry);
        }

        setEntries(data);
        setSummary(stats);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return;
    await deleteDoc(doc(db, "entries", id));
    setEntries((p) => p.filter((e) => e.id !== id));
    toast.success("Deleted");
  };

  if (!isAdmin) return null;

  /* ====================================================== */

  return (
    <AdminLayout>

      <div className="min-h-screen bg-parchment dark:bg-[#0a0a0a] p-6 lg:p-10">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <header className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-ink">
              Admin Dashboard
            </h1>
            <p className="text-muted text-sm">
              Overview of platform activity.
            </p>
          </header>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <StatCard icon={<FiFileText />} label="Entries" value={summary.total} />
            <StatCard icon={<FiLock />} label="Private" value={summary.private} />
            <StatCard icon={<FiMessageSquare />} label="Comments" value={summary.comments} />
            <StatCard icon={<FiHeart />} label="Likes" value={summary.likes} />
            <StatCard icon={<FiEye />} label="Views" value={summary.views} />
          </div>

          {/* RECENT ENTRIES */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">

            <div className="p-6 border-b border-black/5 dark:border-white/5">
              <h2 className="font-bold text-ink">Recent Entries</h2>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5">

              {loadingData ? (
                <p className="p-6 text-muted">Loading metrics...</p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >

                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink truncate pr-4">
                        {entry.title}
                      </h3>

                      <div className="flex gap-3 text-xs text-muted uppercase tracking-wider mt-1">
                        <span>{entry.type}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            entry.timestamp?.seconds * 1000
                          ).toLocaleDateString()}
                        </span>

                        {entry.isPrivate && (
                          <span className="text-accent">🔒 Private</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/edit/${entry.id}`)}
                        className="p-2 hover:text-accent transition-colors"
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                  </div>
                ))
              )}

            </div>
          </div>

        </div>
      </div>

    </AdminLayout>
  );
}

/* ================= SMALL COMPONENT ================= */

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
      <div className="text-2xl text-accent mb-2">{icon}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-muted uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}
