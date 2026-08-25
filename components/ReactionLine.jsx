import { useState } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const EMOJIS = [
  "❤️",
  "✨",
  "🥀",
  "🕯️",
];

export default function ReactionLine({
  entryId,
  lineIndex,
  text,
}) {
  const [counts, setCounts] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCounts = async () => {
    if (loaded || loading) return;

    setLoading(true);

    try {
      const results = await Promise.all(
        EMOJIS.map(async (emoji) => {
          const ref = doc(
            db,
            "entries",
            entryId,
            "reactions",
            `${lineIndex}_${emoji}`
          );

          const snap = await getDoc(ref);

          return {
            emoji,
            count: snap.exists()
              ? Number(snap.data().count || 0)
              : 0,
          };
        })
      );

      const nextCounts = {};

      results.forEach(({ emoji, count }) => {
        if (count > 0) {
          nextCounts[emoji] = count;
        }
      });

      setCounts(nextCounts);
      setLoaded(true);
    } catch (error) {
      console.error(
        "Failed to load reactions:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const openReactions = async () => {
    setOpen((value) => !value);

    if (!loaded) {
      await loadCounts();
    }
  };

  const react = async (emoji) => {
    try {
      const ref = doc(
        db,
        "entries",
        entryId,
        "reactions",
        `${lineIndex}_${emoji}`
      );

      const snap = await getDoc(ref);

      const nextCount = snap.exists()
        ? Number(snap.data().count || 0) + 1
        : 1;

      if (snap.exists()) {
        await updateDoc(ref, {
          count: nextCount,
        });
      } else {
        await setDoc(ref, {
          count: nextCount,
        });
      }

      setCounts((current) => ({
        ...current,
        [emoji]: nextCount,
      }));
    } catch (error) {
      console.error(
        "Reaction failed:",
        error
      );
    }
  };

  return (
    <div className="group mb-2">

      <p
        className="cursor-pointer leading-relaxed"
        onClick={openReactions}
        title="React to this line"
      >
        {text || " "}
      </p>

      {open && (
        <div className="flex gap-2 text-sm mt-1">

          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react(emoji)}
              disabled={loading}
              className="hover:scale-125 transition disabled:opacity-50"
              aria-label={`React with ${emoji}`}
            >
              {emoji}{" "}
              {counts[emoji] || ""}
            </button>
          ))}

        </div>
      )}

    </div>
  );
}