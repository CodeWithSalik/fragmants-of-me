import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "fom_daily_ritual";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nextStreak(lastDate, streak) {
  if (!lastDate) return 1;
  const today = new Date(todayKey());
  const prev = new Date(lastDate);
  const diffDays = Math.round((today - prev) / 86400000);
  if (diffDays === 0) return streak;
  if (diffDays === 1) return streak + 1;
  return 1;
}

export default function DailyRitualCard({ user }) {
  const [state, setState] = useState({
    lastCheckIn: null,
    streak: 0,
    intention: "read",
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setState((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const checkedInToday = state.lastCheckIn === todayKey();

  const save = (next) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCheckIn = () => {
    const updated = {
      ...state,
      lastCheckIn: todayKey(),
      streak: nextStreak(state.lastCheckIn, state.streak),
    };
    save(updated);
  };

  const greeting = useMemo(() => {
    if (state.intention === "write") return "Write one honest line tonight.";
    return "Read one fragment that names your feeling.";
  }, [state.intention]);

  return (
    <section className="mb-16">
      <div className="aura-card reading-mode">
        <div className="aura-card-content p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent/80 font-bold mb-2">Daily Ritual</p>
              <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2">Return gently, not endlessly.</h2>
              <p className="text-muted font-serif italic">{greeting}</p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-widest text-muted/70">Consistency</p>
              <p className="text-2xl font-bold text-ink">{state.streak} day{state.streak === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => save({ ...state, intention: "read" })}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${state.intention === "read" ? "bg-accent text-black border-accent" : "border-black/10 dark:border-white/10 text-muted"}`}
            >
              Tonight I read
            </button>
            <button
              onClick={() => save({ ...state, intention: "write" })}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${state.intention === "write" ? "bg-accent text-black border-accent" : "border-black/10 dark:border-white/10 text-muted"}`}
            >
              Tonight I write
            </button>

            <button
              onClick={handleCheckIn}
              disabled={checkedInToday}
              className="ml-auto px-5 py-2 rounded-full bg-ink text-paper text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {checkedInToday ? "Checked in today" : "Mark today's ritual"}
            </button>

            {!user && (
              <Link href="/login" className="text-xs uppercase tracking-widest text-accent font-bold hover:underline">
                Login to keep your ritual on any device
              </Link>
            )}
            {user && state.intention === "write" && (
              <Link href="/write" className="text-xs uppercase tracking-widest text-accent font-bold hover:underline">
                Start writing now →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
