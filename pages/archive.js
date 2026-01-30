import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Head from "next/head";
import FragmentCard from "@/components/FragmentCard";

export default function Archive() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const q = query(
        collection(db, "entries"),
        where("isPrivate", "==", false),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchEntries();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <Head><title>Archive | Fragments of Me</title></Head>

      <div className="text-center mb-16">
        <div className="w-12 h-1 bg-accent/30 mx-auto mb-6 rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink mb-4">The Archive</h1>
        <p className="text-muted italic">Everything that was ever written.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"></div>)}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted">The archive is empty.</p>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="break-inside-avoid mb-8">
              <FragmentCard entry={entry} index={idx} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}