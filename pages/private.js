import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function Private() {
  const [entries, setEntries] = useState([]);
  const [user] = useAuthState(auth);
  const [message, setMessage] = useState("");


  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      const q = query(
        collection(db, "entries"),
        where("uid", "==", user.uid),
        where("isPrivate", "==", true),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(fetched);
    };

    fetchEntries();
  }, [user]);

  const makePublic = async (id) => {
    try {
      const ref = doc(db, "entries", id);
      await updateDoc(ref, { isPrivate: false });
      setEntries((prev) => prev.filter((e) => e.id !== id));

      setMessage("✅ Visibility updated. Post is now public.");
      setTimeout(() => setMessage(""), 3000); // auto-hide after 3 seconds
    } catch (err) {
      console.error("Error making post public:", err);
      setMessage("❌ Failed to update visibility.");
      setTimeout(() => setMessage(""), 3000);
    }
  };


  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-semibold mb-4">Your Private Entries</h1>
      {message && (
        <div className="mb-4 px-4 py-2 rounded bg-green-100 border border-green-400 text-green-800 text-sm">
          {message}
        </div>
      )}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white p-5 rounded shadow border-l-4 border-amber relative"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-ink">{entry.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColors[entry.type] || "bg-gray-200 text-gray-800"}`}>
              {entry.type?.charAt(0).toUpperCase() + entry.type?.slice(1) || "Unknown"}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {entry.timestamp?.toDate().toLocaleDateString()}
          </p>

          <p className="mt-2 text-gray-700 line-clamp-3">{entry.content.slice(0, 200)}...</p>

          <div className="mt-4 flex gap-3">
            <Link href={`/edit/${entry.id}`}>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Edit
              </button>
            </Link>

            <button
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => makePublic(entry.id)} // <-- Here is the await being used
            >
              Make Public
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const badgeColors = {
  poem: "bg-olive text-white",
  diary: "bg-rustic text-white",
  monologue: "bg-gold text-white",
};
