import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Head from "next/head";
import FragmentCard from "@/components/FragmentCard";

export default function Diary() {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      const q = query(
        collection(db, "entries"),
        where("type", "==", "diary"),
        where("isPrivate", "==", false),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDiaries(results);
      setLoading(false);
    };

    fetchDiaries();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <Head><title>Diary | Fragmants of Me</title></Head>

      <div className="text-center mb-16">
        <div className="w-12 h-1 bg-accent/30 mx-auto mb-6 rounded-full"></div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-ink mb-4 tracking-tight">
          Diary Entries
        </h1>
        <p className="text-muted font-serif italic">Quiet confessions and daily thoughts.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : diaries.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <p className="font-serif italic text-2xl">The pages are empty.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {diaries.map((entry, idx) => (
            <div key={entry.id} className="break-inside-avoid mb-8">
              <FragmentCard entry={entry} index={idx} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}