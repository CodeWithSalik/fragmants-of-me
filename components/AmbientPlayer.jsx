import { useEffect, useRef, useState } from "react";

const moodAudio = {
  warm: "/audio/warm.mp3",
  soft: "/audio/soft.mp3",
  melancholic: "/audio/melancholic.mp3",
  dark: "/audio/dark.mp3",
};

export default function AmbientPlayer({ mood }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = moodAudio[mood] || moodAudio.warm;
    audioRef.current.load();
  }, [mood]);

  const toggle = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      audioRef.current.volume = 0;
      const fade = setInterval(() => {
        if (audioRef.current.volume < 0.25) {
          audioRef.current.volume += 0.02;
        } else {
          clearInterval(fade);
        }
      }, 100);
      audioRef.current.volume = 0.25;
      audioRef.current.loop = true;
    }

    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} />

      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 glass px-4 py-2 text-sm"
      >
        {playing ? "🔊 Ambient On" : "🔈 Ambient Off"}
      </button>
    </>
  );
}
