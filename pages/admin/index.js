import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    getCountFromServer,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getLikesCount } from "@/lib/getLikesCount";
import { getViewsCount } from "@/lib/getViewsCount";
import { useAuth } from "@/lib/auth"; // make sure this gives currentUser
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const [summary, setSummary] = useState({
        total: 0,
        private: 0,
        comments: 0,
        likes: 0,
        views: 0,
    });

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "entries"),
                    orderBy("timestamp", "desc")
                );
                const snapshot = await getDocs(q);
                const entriesData = [];

                let totalComments = 0;
                let totalLikes = 0;
                let totalViews = 0;
                let privateCount = 0;

                for (const docSnap of snapshot.docs) {
                    const entry = { id: docSnap.id, ...docSnap.data() };

                    // Count comments
                    const commentsSnap = await getCountFromServer(
                        collection(doc(db, "entries", entry.id), "comments")
                    );
                    const commentCount = commentsSnap.data().count;
                    totalComments += commentCount;

                    // Count likes
                    const likeCount = await getLikesCount(entry.id);
                    totalLikes += likeCount;

                    // Count views
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
            }
            setLoading(false);
        };

        fetchData();
    }, [currentUser]);

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

    return (
         <AdminLayout>
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>

            <div className="mb-6 text-sm text-gray-600 text-center">
                Logged in as: <span className="font-semibold">{currentUser?.email}</span>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All Types</option>
                    <option value="poem">Poem</option>
                    <option value="diary">Diary</option>
                    <option value="monologue">Monologue</option>
                </select>

                {/* Summary Stats */}
                <div className="text-sm text-gray-600">
                    <strong>{summary.total}</strong> posts •{" "}
                    <strong>{summary.private}</strong> private •{" "}
                    <strong>{summary.comments}</strong> comments •{" "}
                    <strong>{summary.likes}</strong> likes •{" "}
                    <strong>{summary.views}</strong> views
                </div>
            </div>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : filteredEntries.length === 0 ? (
                <p className="text-center text-gray-500">No entries found.</p>
            ) : (
                filteredEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className="mb-4 p-4 bg-white rounded shadow hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold">{entry.title}</h2>
                        <p className="text-sm text-gray-600">
                            Type: {entry.type} |{" "}
                            <span className="text-blue-600">
                                {entry.isPrivate ? "🔒 Private" : "🔓 Public"}
                            </span>{" "}
                            | Comments: {entry.commentCount} | Likes: {entry.likeCount} | Views:{" "}
                            {entry.viewCount}
                        </p>
                        <p className="text-xs text-gray-500">
                            Posted: {new Date(entry.timestamp?.seconds * 1000).toLocaleString()}
                        </p>
                        <div className="mt-2 flex gap-4">
                            <button
                                onClick={() => router.push(`/edit/${entry.id}`)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-sm text-red-600 hover:underline"
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
