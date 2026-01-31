import { useEffect, useRef } from "react";

export default function AdUnit({ 
  slot, 
  format = "auto", 
  responsive = "true",
  className = "" 
}) {
  const adRef = useRef(false);

  useEffect(() => {
    // Prevent double-injection in React Strict Mode
    if (adRef.current) return;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current = true;
      }
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  // Development placeholder
  if (process.env.NODE_ENV === "development") {
    return (
      <div className={`bg-black/5 dark:bg-white/5 border border-dashed border-ink/20 flex items-center justify-center text-xs font-mono text-muted p-4 ${className}`} style={{ minHeight: '280px' }}>
        [AdSense Unit: {slot}] (Visible in Production)
      </div>
    );
  }

  return (
    <div className={`ad-container my-8 overflow-hidden flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-4872587981884740" 
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}