import { useEffect, useRef, useState } from "react";
import { FiMusic, FiVolume2, FiVolumeX } from "react-icons/fi";

// Default public audio for testing. Replace with your local files:
// warm: "/audio/warm.mp3", etc.
const moodAudio = {
  warm: "/audio/warm.mp3",
  soft: "/audio/soft.mp3",
  melancholic: "/audio/melancholic.mp3",
  dark: "/audio/dark.mp3",
};

export default function AmbientPlayer({ mood = "warm" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0);

  // 1. Handle Mood Change (Seamless Crossfade or Switch)
  useEffect(() => {
    if (!audioRef.current) return;
    
    const src = moodAudio[mood] || moodAudio.warm;
    
    // Only change source if it's actually different
    if (audioRef.current.src !== new URL(src, document.baseURI).href) {
      // If playing, we could fade out here, but for simplicity we switch track
      audioRef.current.src = src;
      if (playing) {
        audioRef.current.play().catch(e => console.log("Playback interrupted"));
      }
    }
  }, [mood, playing]);

  // 2. Toggle Play/Pause with Fade Effect
  const toggle = () => {
    if (!audioRef.current) return;

    if (playing) {
      // FADE OUT
      const fadeOut = setInterval(() => {
        if (audioRef.current.volume > 0.05) {
          audioRef.current.volume -= 0.05;
        } else {
          clearInterval(fadeOut);
          audioRef.current.pause();
          setPlaying(false);
        }
      }, 50);
    } else {
      // FADE IN
      audioRef.current.volume = 0;
      audioRef.current.loop = true;
      audioRef.current.play().catch((e) => console.log("Audio play error:", e));
      setPlaying(true);

      const fadeIn = setInterval(() => {
        if (audioRef.current.volume < 0.3) { // Max volume 30%
          audioRef.current.volume = Math.min(0.3, audioRef.current.volume + 0.05);
        } else {
          clearInterval(fadeIn);
        }
      }, 100);
    }
  };

  return (
    <>
      <audio ref={audioRef} />

      <button
        onClick={toggle}
        aria-label="Toggle Ambient Sound"
        // POSITION: Bottom Left
        // STYLE: Matches Global Premium aesthetic
        className={`fixed bottom-8 left-8 z-50 p-4 rounded-full 
          backdrop-blur-md border shadow-2xl transition-all duration-500 group
          ${playing 
            ? "bg-accent text-white border-accent shadow-accent/40 rotate-0" 
            : "bg-white/80 dark:bg-black/80 border-black/5 dark:border-white/10 text-ink hover:scale-110"
          }
        `}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          {playing ? (
            <FiVolume2 className="w-6 h-6 animate-pulse" />
          ) : (
            <FiMusic className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
          )}
          
          {/* Ripple Ring */}
          {playing && (
            <span className="absolute inset-0 rounded-full border border-white animate-ping opacity-20"></span>
          )}
        </div>

        {/* Tooltip */}
        <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-black/80 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none capitalize">
          {playing ? `${mood} Mode` : "Play Ambience"}
        </span>
      </button>
    </>
  );
}