import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

const ADMIN_UID = "SIpfZSIJM5RKrvLahp7I4DLwiE93";

export default function EditEntry() {
  const router = useRouter();
  const { id } = router.query;
  const [user, loading] = useAuthState(auth);

  const [entry, setEntry] = useState(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("diary");
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    if (!id || !user || user.uid !== ADMIN_UID) return;
    const fetchData = async () => {
      const ref = doc(db, "entries", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEntry(data);
        setTitle(data.title || "");
        setContent(data.content || "");
        setType(data.type || "diary");
        setTimestamp(data.timestamp?.toDate() || new Date());
      }
    };
    fetchData();
  }, [id, user]);
  const makePrivate = async () => {
    try {
      const ref = doc(db, "entries", id);
      await updateDoc(ref, { isPrivate: true });
      toast.success("🔒 Entry is now private.");
      setEntry((prev) => ({ ...prev, isPrivate: true }));
    } catch (error) {
      toast.error("❌ Failed to update visibility.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Title/content empty");
    const ref = doc(db, "entries", id);
    await updateDoc(ref, { title, content, type, timestamp });
    toast.success("✅ Entry updated!");
    router.push(`/entry/${id}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user || user.uid !== ADMIN_UID)
    return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-amber-dark">Edit Entry</h1>

      {/* ✅ Styled Message */}
      {message && (
        <div className="mb-6 px-4 py-2 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm">
          {message}
        </div>
      )}

      {/* 🔒 Show only if not already private */}
      {!entry?.isPrivate && (
        <button
          className="mb-6 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          onClick={makePrivate}
        >
          Make Private
        </button>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Content</label>
          <textarea
            className="w-full p-2 border rounded h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            className="w-full p-2 border rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="diary">Diary</option>
            <option value="poem">Poem</option>
            <option value="monologue">Monologue</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <DatePicker
            selected={timestamp}
            onChange={(date) => setTimestamp(date)}
            className="p-2 border rounded w-full"
            dateFormat="dd MMM yyyy"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-amber text-white rounded hover:bg-amber-dark"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
