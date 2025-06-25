import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function Monologue() {
  const [monologues, setMonologues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonologues = async () => {
      const q = query(
        collection(db, "entries"),
        where("type", "==", "monologue"),
        where("isPrivate", "==", false),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMonologues(results);
      setLoading(false);
    };

    fetchMonologues();
  }, []);
  const badgeColors = {
    poem: "badge-poem",
    diary: "badge-diary",
    monologue: "badge-monologue",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Monologues</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading monologues...</p>
      ) : monologues.length === 0 ? (
        <p className="text-center text-gray-500">No monologues yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {monologues.map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.id}`}>
              <div className="bg-white p-6 rounded-xl border-l-4 border-amber-600 shadow-md hover:shadow-lg group transition-all">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-amber-900 group-hover:underline">
                    {entry.title}
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                    Monologue
                  </span>
                </div>
                <p className="text-sm text-gray-600">✍️ by {entry.authorName}</p>

                <p className="text-sm text-gray-500 mb-1">
                  {entry.timestamp?.toDate().toLocaleDateString()}
                </p>
                <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                  {entry.content.slice(0, 200)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
