import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Head from "next/head";
import FragmentCard from "@/components/FragmentCard";

export default function Poems() {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoems = async () => {
      const q = query(
        collection(db, "entries"),
        where("type", "==", "poem"),
        where("isPrivate", "==", false),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPoems(results);
      setLoading(false);
    };

    fetchPoems();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <Head><title>Poems | Fragments of Me</title></Head>

      <div className="text-center mb-16">
        <div className="w-12 h-1 bg-accent/30 mx-auto mb-6 rounded-full"></div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-ink mb-4 tracking-tight">
          Poetry Collection
        </h1>
        <p className="text-muted font-serif italic">Verses written in silence.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : poems.length === 0 ? (
        <p className="text-center text-muted mt-10">No poems found.</p>
      ) : (
        /* MASONRY LAYOUT */
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {poems.map((entry, idx) => (
            <div key={entry.id} className="break-inside-avoid mb-8">
              <FragmentCard entry={entry} index={idx} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}