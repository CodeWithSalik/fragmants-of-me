import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync with localStorage on mount
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      // STICKY POSITIONING HERE: fixed bottom-8 right-8
      className="fixed bottom-8 right-8 z-50 p-4 rounded-full 
                 bg-white/80 dark:bg-black/80 backdrop-blur-md 
                 border border-black/5 dark:border-white/10 shadow-2xl 
                 text-ink hover:scale-110 active:scale-95 transition-all duration-300 group"
    >
      <div className="relative w-6 h-6">
        <FiSun 
          className={`absolute inset-0 w-6 h-6 transition-all duration-500 
            ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} 
        />
        <FiMoon 
          className={`absolute inset-0 w-6 h-6 transition-all duration-500 
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`} 
        />
      </div>
      
      {/* Tooltip hint */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-black/80 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isDark ? "Lights On" : "Lights Off"}
      </span>
    </button>
  );
}