import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import Head from "next/head"; // ✅ Import Head from next/head

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-300 mb-6">Monologues</h1>
      <Head>

        <meta name="google-adsense-account" content="ca-pub-3631011011308556" />
        {/* ✅ Google AdSense script for Auto Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3631011011308556"
          crossOrigin="anonymous"
        ></script>
      </Head>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading monologues...</p>
      ) : monologues.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No monologues yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {monologues.map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.id}`}>
              <div className="bg-white dark:bg-[#2c261f] text-ink dark:text-[#fefae0] p-6 rounded-xl border-l-4 border-amber-600 shadow-md hover:shadow-lg group transition-all">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 group-hover:underline">
                    {entry.title}
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-[#856a32] dark:text-white">
                    Monologue
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-[#d4cfc7]">✍️ by {entry.authorName}</p>
                <p className="text-sm text-gray-500 dark:text-[#b9b4a7] mb-1">
                  {entry.timestamp?.toDate().toLocaleDateString()}
                </p>
                <p className="text-gray-800 dark:text-[#e0dcc6] text-sm leading-relaxed line-clamp-3">
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
