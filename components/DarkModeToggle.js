// components/DarkModeToggle.js
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleDark = () => {
    const root = document.documentElement;
    const newState = !isDark;

    if (newState) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setIsDark(newState);
  };

  return (
    <button
      onClick={toggleDark}
      className="fixed bottom-4 left-4 bg-amber-dark text-white px-3 py-1 rounded shadow hover:bg-amber z-50 text-sm"
    >
      {isDark ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}
