import { useEffect, useState } from "react";
import FragmentCard from "@/components/FragmentCard";
import { fetchEntriesByTypePage } from "@/lib/data/entries";

export default function EntryTypePage({ title, subtitle, type, emptyTitle, emptySubtitle, accentClass = "bg-accent/30" }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      const { entries: fetched } = await fetchEntriesByTypePage({ type });
      setEntries(fetched);
      setLoading(false);
    };
    loadEntries();
  }, [type]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-16">
        <div className={`w-12 h-1 ${accentClass} mx-auto mb-6 rounded-full`}></div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-ink mb-4 tracking-tight">{title}</h1>
        <p className="text-muted font-serif italic">{subtitle}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <p className="font-serif italic text-2xl">{emptyTitle}</p>
          {emptySubtitle && <p className="text-sm mt-2">{emptySubtitle}</p>}
        </div>
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
