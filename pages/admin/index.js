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
import { getLikesCount } from "@/lib/getLikesCount";
import { getViewsCount } from "@/lib/getViewsCount";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("");
  const [summary, setSummary] = useState({
    total: 0,
    private: 0,
    comments: 0,
    likes: 0,
    views: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role !== "admin") {
          toast.error("Access denied");
          sessionStorage.removeItem("admin_pin_verified");
          return router.replace("/");
        }

        const pinVerified = sessionStorage.getItem("admin_pin_verified") === "true";
        if (!pinVerified) {
          sessionStorage.removeItem("admin_pin_verified");
          return router.replace("/admin/auth");
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Admin role check failed", err);
        toast.error("Access error");
        router.push("/");
      }
    };

    if (!loading) verifyAccess();
  }, [user, loading]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      const toastId = toast.loading("Loading dashboard...");
      setLoadingData(true);
      try {
        const q = query(collection(db, "entries"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const entriesData = [];

        let totalComments = 0;
        let totalLikes = 0;
        let totalViews = 0;
        let privateCount = 0;

        for (const docSnap of snapshot.docs) {
          const entry = { id: docSnap.id, ...docSnap.data() };

          const commentsSnap = await getCountFromServer(
            collection(doc(db, "entries", entry.id), "comments")
          );
          const commentCount = commentsSnap.data().count;
          totalComments += commentCount;

          const likeCount = await getLikesCount(entry.id);
          totalLikes += likeCount;

          const viewCount = await getViewsCount(entry.id);
          totalViews += viewCount;

          if (entry.isPrivate) privateCount++;

          entriesData.push({
            ...entry,
            commentCount,
            likeCount,
            viewCount,
          });
        }

        setEntries(entriesData);
        setSummary({
          total: entriesData.length,
          private: privateCount,
          comments: totalComments,
          likes: totalLikes,
          views: totalViews,
        });
      } catch (err) {
        console.error("Error loading admin data:", err);
        toast.error("Failed to load dashboard");
      } finally {
        toast.dismiss(toastId);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteDoc(doc(db, "entries", id));
      toast.success("Deleted successfully");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredEntries = filter
    ? entries.filter((e) => e.type === filter)
    : entries;

  if (loading || !user || !isAdmin)
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <p>🛠 Loading secure admin data...</p>
      </div>
    );

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4 text-center text-amber-700 border-b pb-2 border-amber-300">Admin Dashboard</h1>

        <div className="mb-6 text-xs text-gray-400 text-center">
          Logged in as: <span className="font-semibold text-green-500">{user.email}</span>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded bg-black text-green-400 border-green-500"
          >
            <option value="">All Types</option>
            <option value="poem">Poem</option>
            <option value="diary">Diary</option>
            <option value="monologue">Monologue</option>
          </select>

          <div className="text-sm text-gray-400 font-mono">
            <strong>{summary.total}</strong> posts • <strong>{summary.private}</strong> private • <strong>{summary.comments}</strong> comments • <strong>{summary.likes}</strong> likes • <strong>{summary.views}</strong> views
          </div>
        </div>

        {loadingData ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : filteredEntries.length === 0 ? (
          <p className="text-center text-gray-500">No entries found.</p>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="mb-4 p-4 bg-black text-green-400 border border-green-700 rounded shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-green-300">{entry.title}</h2>
              <p className="text-sm">
                Type: <span className="text-blue-400">{entry.type}</span> | {entry.isPrivate ? "🔒 Private" : "🔓 Public"} | Comments: {entry.commentCount} | Likes: {entry.likeCount} | Views: {entry.viewCount}
              </p>
              <p className="text-xs text-gray-500">
                Posted: {new Date(entry.timestamp?.seconds * 1000).toLocaleString()}
              </p>
              <div className="mt-2 flex gap-4">
                <button
                  onClick={() => router.push(`/edit/${entry.id}`)}
                  className="text-sm text-blue-400 hover:underline"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-sm text-red-400 hover:underline"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
