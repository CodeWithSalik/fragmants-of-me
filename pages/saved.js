import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import FragmentCard from "@/components/FragmentCard";
import Head from "next/head";

export default function SavedPage() {
  const [user] = useAuthState(auth);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadSaved = async () => {
      try {
        const savedRef = collection(db, "users", user.uid, "saved");
        const snap = await getDocs(savedRef);
        
        // Fetch actual entry data for each saved ID
        const promises = snap.docs.map(s => getDoc(doc(db, "entries", s.id)));
        const results = await Promise.all(promises);
        
        const fetchedEntries = results
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));

        setEntries(fetchedEntries);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    loadSaved();
  }, [user]);

  if (!user) return <div className="min-h-screen flex items-center justify-center text-muted">Please login.</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <Head><title>Saved | Fragmants of Me</title></Head>

      <div className="text-center mb-16">
        <div className="w-12 h-1 bg-accent/30 mx-auto mb-6 rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink mb-4">Saved Fragmants</h1>
        <p className="text-muted italic">Pieces you chose to keep.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted py-20">Your collection is empty.</p>
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