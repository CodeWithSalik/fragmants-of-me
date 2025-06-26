import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin"; // ✅ make sure this returns true/false

export default function EditEntry() {
  const router = useRouter();
  const { id } = router.query;
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const [entry, setEntry] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("diary");
  const [timestamp, setTimestamp] = useState(new Date());
  const [authorName, setAuthorName] = useState("");

  const AUTHOR_OPTIONS = [
    "Salik Pirzada",
    "Anonymous",
    "My Inner Self",
    "Fragments",
    "Kashmir Stag",
    "Abdul Kareem"
  ];

  // ✅ Check admin status
  useEffect(() => {
    if (user?.uid) {
      checkIfAdmin(user.uid).then(setIsAdmin);
    }
  }, [user]);

  // ✅ Fetch entry data if user is admin
  useEffect(() => {
    if (!id || !user || !isAdmin) return;
    const fetchData = async () => {
      const ref = doc(db, "entries", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEntry(data);
        setTitle(data.title || "");
        setContent(data.content || "");
        setType(data.type || "diary");
        setAuthorName(data.authorName || "");
        setTimestamp(data.timestamp?.toDate() || new Date());
      }
    };
    fetchData();
  }, [id, user, isAdmin]);

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
    if (!title.trim() || !content.trim() || !authorName) {
      return toast.error("Please fill in all fields, including author.");
    }
    const ref = doc(db, "entries", id);
    await updateDoc(ref, { title, content, type, timestamp, authorName });
    toast.success("✅ Entry updated!");
    router.push(`/entry/${id}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user || !isAdmin)
    return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-amber-dark">Edit Entry</h1>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block mb-1 font-medium">Author</label>
            <select
              className="w-full p-2 border rounded"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            >
              <option value="">Select author</option>
              {AUTHOR_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
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
