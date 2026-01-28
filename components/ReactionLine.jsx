import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const EMOJIS = ["❤️", "✨", "🥀", "🕯️"];

export default function ReactionLine({ entryId, lineIndex, text }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    EMOJIS.forEach(async (emoji) => {
      const ref = doc(
        db,
        "entries",
        entryId,
        "reactions",
        `${lineIndex}_${emoji}`
      );

      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCounts((c) => ({ ...c, [emoji]: snap.data().count }));
      }
    });
  }, []);

  const react = async (emoji) => {
    const ref = doc(
      db,
      "entries",
      entryId,
      "reactions",
      `${lineIndex}_${emoji}`
    );

    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, { count: snap.data().count + 1 });
      setCounts((c) => ({ ...c, [emoji]: snap.data().count + 1 }));
    } else {
      await setDoc(ref, { count: 1 });
      setCounts((c) => ({ ...c, [emoji]: 1 }));
    }
  };

  return (
    <div className="group mb-2">

      <p className="cursor-pointer leading-relaxed">
        {text || " "}
      </p>

      <div className="opacity-0 group-hover:opacity-100 transition flex gap-2 text-sm mt-1">

        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => react(e)}
            className="hover:scale-125 transition"
          >
            {e} {counts[e] || ""}
          </button>
        ))}

      </div>

    </div>
  );
}
