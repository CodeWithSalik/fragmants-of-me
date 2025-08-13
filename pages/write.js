import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
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
  const [authorName, setAuthorName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const router = useRouter();

  const AUTHOR_OPTIONS = [
    "Salik Pirzada",
    "Pirzada Faizan",
    "Khushnama",
    "Sahiba Yaseen",
    "Dania Bashir",
    "Cobra Daniel",
    "Black Widow",
    "Daniyal",
    "Anonymous",
    "Abdul Kareem",
    "My Inner Self",
    "Someone Else",
    "Pirzada Abrar Nazir"
  ];

  // 🔐 Auth + Admin Verification
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

  // 📝 Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !authorName) {
      toast.error("Please fill all fields including author name.");
      return;
    }

    await addDoc(collection(db, "entries"), {
      title: title.trim(),
      content: content.trim(),
      type,
      isPrivate,
      timestamp: selectedDate,
      uid: user.uid,
      authorName,
    });

    await fetch("https://newyear-backend.onrender.com/send-broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `📢 New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
        message: `
          <div style="font-family: 'Georgia', serif; background-color: #fefcf9; color: #3c2f2f; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); max-width: 600px; margin: auto;">
  <h2 style="color: #a97142; font-weight: 600; margin-bottom: 10px;">📝 A New ${type} Awaits: <span style="font-style: italic;">${title}</span></h2>
  
  <p style="margin: 0 0 8px;"><strong>by ${authorName}</strong></p>
  
  <p style="line-height: 1.6;">${content.slice(0, 300)}...</p>
  
  <p style="margin-top: 16px;">
    <a href="https://fragmants-of-me.vercel.app" target="_blank" style="color: #a97142; text-decoration: none; font-weight: 500;">
      ➤ Read the full piece
    </a>
  </p>
  
  <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
  
  <p style="color: #777; font-size: 13px;">
    This is an automated message from <strong>Fragmants of Me</strong> — a journal of thoughts, monologues, and memories.
  </p>
</div>

        `,
      }),
    });

    toast.success("✅ Entry uploaded successfully!");
    router.push("/");
  };

  if (loading) return <p className="p-10 text-center text-gray-600 dark:text-[#fefae0]">Verifying access...</p>;

  return (
    <div className="min-h-screen bg-parchment dark:bg-[#1e1b16] px-6 py-10 text-ink dark:text-[#fefae0]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-dark mb-6">📝 Write Entry</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Title"
            className="w-full border border-amber-dark p-2 rounded bg-white dark:bg-[#2c261f] dark:text-[#fefae0]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            className="w-full border border-amber-dark p-3 rounded h-56 bg-white dark:bg-[#2c261f] dark:text-[#fefae0]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-amber-dark p-2 rounded bg-white dark:bg-[#2c261f] dark:text-[#fefae0]"
            >
              <option value="poem">Poem</option>
              <option value="diary">Diary</option>
              <option value="monologue">Monologue</option>
            </select>

            <select
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="border border-amber-dark p-2 rounded bg-white dark:bg-[#2c261f] dark:text-[#fefae0]"
            >
              <option value="">Select Author</option>
              {AUTHOR_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />
              Private
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#fefae0] mb-1">
              Entry Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd MMM yyyy"
              className="border p-2 rounded w-full bg-white dark:bg-[#2c261f] dark:text-[#fefae0] border-gray-300 dark:border-[#4d3f2d]"
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
