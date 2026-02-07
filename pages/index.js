import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Head from "next/head";
import FragmentCard from "@/components/FragmentCard";
import { useAuth } from "@/lib/auth";
import { FiSearch } from "react-icons/fi";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [search, setSearch] = useState("");
  const [followFeed, setFollowFeed] = useState([]);

  // Fetch Logic (Kept mostly same, just cleaned up)
  useEffect(() => {
    const fetchQuote = async () => {
      const ref = doc(db, "settings", "quoteOfTheDay");
      const snap = await getDoc(ref);
      if (snap.exists()) setQuote(snap.data().text);
    };
    fetchQuote();

    const fetchEntries = async () => {
      const q = query(collection(db, "entries"), where("isPrivate", "==", false), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const loadFollowFeed = async () => {
      const snap = await getDocs(collection(db, "users", currentUser.uid, "following"));
      const authorIds = snap.docs.map(d => d.id);
      if (authorIds.length === 0) return;
      const q = query(collection(db, "entries"), where("uid", "in", authorIds), where("isPrivate", "==", false), orderBy("timestamp", "desc"));
      const postsSnap = await getDocs(q);
      setFollowFeed(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadFollowFeed();
  }, [currentUser]);

  // Search Filter
  const filteredEntries = entries.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Head><title>Fragmants of Me</title></Head>

      {/* --- 1. HERO SECTION (Editorial Style) --- */}
      <div className="relative pt-24 pb-20 text-center">
        
        {/* Subtle decorative flourish */}
        <div className="w-16 h-1 bg-accent/20 mx-auto mb-8 rounded-full"></div>

        <h1 className="text-5xl md:text-8xl font-serif font-black text-ink mb-6 tracking-tight leading-[0.9]">
          Fragmants <br className="sm:hidden" /> <span className="italic text-accent font-light">of</span> Me
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted leading-relaxed mb-10 font-serif antialiased opacity-90">
          A collection of poems, monologues, and quiet confessions.<br className="hidden md:block"/> 
          Written to be <span className="italic text-ink font-semibold">felt</span> more than understood.
        </p>

        {quote && (
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-surface border border-black/5 dark:border-white/5 shadow-sm max-w-2xl mx-auto">
            <span className="text-4xl text-accent font-serif leading-none h-4 overflow-visible">“</span>
            <p className="italic text-ink/80 font-serif text-sm md:text-base pr-2 line-clamp-1">{quote}</p>
          </div>
        )}
      </div>

      {/* --- 2. FLOATING SEARCH BAR --- */}
      <div className="sticky top-24 z-30 max-w-lg mx-auto mb-20">
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
          <div className="relative flex items-center bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-lg transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:scale-[1.02]">
            <FiSearch className="ml-5 text-muted text-xl" />
            <input
              type="text"
              placeholder="Search for a feeling..."
              className="w-full py-4 px-4 bg-transparent text-ink placeholder-muted/70 focus:outline-none text-lg font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- 3. FOLLOW FEED --- */}
      {followFeed.length > 0 && (
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-serif font-bold text-ink">Following</h2>
            <div className="h-[1px] flex-grow bg-black/10 dark:bg-white/10"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followFeed.map((entry, idx) => (
              <FragmentCard key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* --- 4. MAIN MASONRY FEED --- */}
      <section>
        <div className="flex items-center justify-center mb-12">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-accent/80 border-b-2 border-accent/20 pb-2">
            Latest Fragmants
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="font-serif italic text-2xl">Silence...</p>
            <p className="text-sm mt-2">No Fragmants found matching your search.</p>
          </div>
        ) : (
          /* CSS Columns for true Masonry layout */
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredEntries.map((entry, idx) => (
              <div key={entry.id} className="break-inside-avoid mb-8">
                {/* Pass Index for staggered animation */}
                <FragmentCard entry={entry} index={idx} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}