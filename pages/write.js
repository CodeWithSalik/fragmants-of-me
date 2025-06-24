import { useEffect, useState } from "react";
import { auth, db, ADMIN_UID } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function WritePage() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("poem");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u || u.uid !== ADMIN_UID) {
        router.push("/");
      } else {
        setUser(u);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!title.trim() || !content.trim()) return alert("All fields required!");

  await addDoc(collection(db, "entries"), {
    title,
    content,
    type,
    isPrivate,
    timestamp: selectedDate,
    uid: user.uid,
  });

  // Send email to all registered users
  await fetch("http://127.0.0.1:4400/send-broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: `📢 New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
      message: `${content.slice(0, 300)}...\n\nVisit fragmants-of-me.vercel.app to read more.`,
    }),
  });

  router.push("/");
};

  if (loading) return <p className="p-10">Verifying...</p>;

  return (

    <div className="min-h-screen bg-parchment px-6 py-10 text-ink">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-dark mb-6">📝 Write Entry</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Title"
            className="w-full border border-amber-dark p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            className="w-full border border-amber-dark p-3 rounded h-56"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-4 items-center">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-amber-dark p-2 rounded"
            >
              <option value="poem">Poem</option>
              <option value="diary">Diary</option>
              <option value="monologue">Monologue</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />
              <span className="text-sm">Private</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd MMM yyyy"
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-amber text-white rounded hover:bg-amber-dark transition"
          >
            Save Entry
          </button>

        </form>
      </div>
    </div>
  );
}
