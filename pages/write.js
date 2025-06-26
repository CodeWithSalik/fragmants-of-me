import { useEffect, useState } from "react";
import { auth, db, ADMIN_UID } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";


export default function WritePage() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("poem");
  const [authorName, setAuthorName] = useState(""); // 🆕
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const router = useRouter();

  const AUTHOR_OPTIONS = ["Salik Pirzada", "Anonymous","Abdul Kareem", "My Inner Self", "Someone Else"]; // ✏️ Customize as needed

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      router.push("/");
      return;
    }

    const isAdmin = await checkIfAdmin(u.uid);
    if (!isAdmin) {
      router.push("/");
      return;
    }

    setUser(u);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName) {
      return alert("All fields including author must be filled!");
    }

    await addDoc(collection(db, "entries"), {
      title: title.trim(),
      content: content.trim(),
      type,
      isPrivate,
      timestamp: selectedDate,
      uid: user.uid,
      authorName, // 🆕 saved to Firestore
    });

    // ✅ Send broadcast
    await fetch("https://newyear-backend.onrender.com/send-broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `📢 New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
        message: `
          <div style="font-family: 'Georgia', serif; color: #3c2f2f; background-color: #fefcf9; padding: 20px;">
            <h2 style="color: #a97142;">📢 New ${type}: ${title}</h2>
            <p><em>by ${authorName}</em></p>
            <p>${content.slice(0, 300)}...</p>
            <p><a href="https://fragmants-of-me.vercel.app" target="_blank" style="color:#a97142;">Read full piece</a></p>
            <hr/>
            <p style="color: #888; font-size: 13px;">You are receiving this email from Fragments of Me.</p>
          </div>
        `,
      }),
    });

    router.push("/");
    toast.success("✅ Entry Uploaded Successfully!");
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-amber-dark p-2 rounded"
            >
              <option value="poem">Poem</option>
              <option value="diary">Diary</option>
              <option value="monologue">Monologue</option>
            </select>

            {/* 🆕 Author dropdown */}
            <select
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="border border-amber-dark p-2 rounded"
            >
              <option value="">Select Author</option>
              {AUTHOR_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Date
            </label>
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
