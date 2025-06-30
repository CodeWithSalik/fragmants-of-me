import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import Head from "next/head"; // ✅ Import Head from next/head

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const fetchQuote = async () => {
      const ref = doc(db, "settings", "quoteOfTheDay");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setQuote(snap.data().text);
      }
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      const q = query(
        collection(db, "entries"),
        where("isPrivate", "==", false),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(results);
      setLoading(false);
    };

    fetchEntries();
  }, []);

  const badgeColors = {
    poem: "badge-poem",
    diary: "badge-diary",
    monologue: "badge-monologue",
  };

  return (

    <div className="max-w-3xl mx-auto px-4 py-10">
      {quote && (
        <div className="mb-8 text-center italic text-lg sm:text-xl text-gray-700 dark:text-[#d4cfc7] font-serif px-4">
          “{quote}”
        </div>
      )}
      <Head>

        <meta name="google-adsense-account" content="ca-pub-3631011011308556" />
        {/* ✅ Google AdSense script for Auto Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3631011011308556"
          crossOrigin="anonymous"
        ></script>
      </Head>

      <h1 className="text-3xl font-bold text-amber-900 dark:text-[#fcdca1] mb-6">
        Latest Fragments
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-[#b9b4a7]">Loading entries...</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-[#b9b4a7]">No entries yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.id}`}>
              <div className="bg-white dark:bg-[#2c261f] text-ink dark:text-[#fefae0] p-6 rounded-xl border-l-4 border-amber-600 shadow-md hover:shadow-lg group transition-all">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-amber-900 dark:text-[#fcdca1] group-hover:underline">
                    {entry.title}
                  </h2>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColors[entry.type] || "bg-gray-200 text-gray-800"
                      }`}
                  >
                    {entry?.type?.charAt(0).toUpperCase() + entry?.type?.slice(1) || "Unknown"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-[#d4cfc7]">
                  ✍️ by {entry.authorName}
                </p>

                <p className="text-sm text-gray-500 dark:text-[#b9b4a7] mb-1">
                  {entry.timestamp?.toDate().toLocaleDateString()}
                </p>
                <p className="text-gray-800 dark:text-[#e9e6da] text-sm leading-relaxed line-clamp-3">
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
