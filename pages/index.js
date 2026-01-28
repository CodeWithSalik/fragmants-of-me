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
import Head from "next/head";

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
      <Head>
        <meta name="google-adsense-account" content="ca-pub-3631011011308556" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3631011011308556"
          crossOrigin="anonymous"
        ></script>
      </Head>

      {/* 📜 Quote Section */}
      {quote && (
        <div className="mb-4 text-center italic text-lg sm:text-xl text-gray-700 dark:text-[#d4cfc7] font-serif px-4">
          “{quote}”
        </div>
      )}

      {/* ☕ Support Button */}
      <div className="mb-8 text-center">
        <a
          href="https://coff.ee/codewithsalik"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 text-sm font-medium bg-accent text-white rounded-full shadow hover:bg-amber-700 transition"
        >
          ☕ Buy me a coffee / Support my work
        </a>
      </div>

      <h1 className="text-3xl font-bold text-accent dark:text-[#fcdca1] mb-6">
        Latest Fragments
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-[#b9b4a7]">Loading entries...</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-[#b9b4a7]">No entries yet.</p>
      ) : (
        <div className="stack">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.id}`}>
              <div className="bg-white dark:bg-[#2c261f] text-ink dark:text-[#fefae0] p-6 rounded-xl border-l-4 border-amber-600 shadow-md hover:shadow-lg group transition-all">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-accent dark:text-[#fcdca1] group-hover:underline">
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
