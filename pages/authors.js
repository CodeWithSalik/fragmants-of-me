import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Head from "next/head";

export async function getServerSideProps() {
  // 1. Fetch Authors
  const q = query(collection(db, "authors"), orderBy("joinedAt", "desc"));
  const snap = await getDocs(q);

  // 2. Serialize Data (The Fix)
  const authors = snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || "Anonymous",
      bio: data.bio || "Writer at Fragments of Me",
      // FIX: Convert Timestamp to String so Next.js doesn't crash
      joinedAt: data.joinedAt?.toDate().toLocaleDateString() || null,
    };
  });

  return { props: { authors } };
}

export default function AuthorsPage({ authors }) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <Head><title>Authors | Fragments of Me</title></Head>

      <div className="text-center mb-16">
        <div className="w-12 h-1 bg-accent/30 mx-auto mb-6 rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink mb-4 tracking-tight">
          Our Voices
        </h1>
        <p className="text-muted font-serif italic">The souls behind the silence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map(a => (
          <Link key={a.id} href={`/author/${a.id}`}>
            <div className="aura-card h-full group cursor-pointer">
              <div className="aura-card-content p-8 flex flex-col justify-center text-center items-center h-full min-h-[240px]">
                
                {/* Avatar Placeholder */}
                <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center text-3xl mb-6 shadow-inner">
                  {a.name.charAt(0)}
                </div>
                
                <h2 className="text-2xl font-bold text-ink group-hover:text-accent transition-colors">
                  {a.name}
                </h2>
                
                <p className="text-sm text-muted mt-3 line-clamp-2 leading-relaxed">
                  {a.bio}
                </p>

                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 w-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent opacity-60 group-hover:opacity-100 transition-all">
                    View Profile →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}