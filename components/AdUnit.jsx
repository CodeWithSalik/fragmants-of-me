import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = "ca-pub-3631011011308556";

export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}) {
  const adInitialized = useRef(false);

  useEffect(() => {
    if (adInitialized.current) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    try {
      /*
       * Google AdSense uses this global queue.
       *
       * It is safe to push into the queue even when
       * the AdSense script is still loading.
       */
      window.adsbygoogle = window.adsbygoogle || [];

      window.adsbygoogle.push({});

      adInitialized.current = true;
    } catch (error) {
      console.error(
        "Google AdSense initialization failed:",
        error
      );
    }
  }, []);

  /*
   * Development placeholder.
   *
   * This prevents real AdSense requests while
   * developing locally.
   */
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`
          bg-black/5
          dark:bg-white/5
          border
          border-dashed
          border-ink/20
          flex
          items-center
          justify-center
          text-xs
          font-mono
          text-muted
          p-4
          ${className}
        `}
        style={{
          minHeight: "280px",
        }}
      >
        [AdSense Unit: {slot}] (Visible in Production)
      </div>
    );
  }

  /*
   * Don't render an invalid AdSense unit.
   */
  if (!slot) {
    return null;
  }

  return (
    <div
      className={`
        ad-container
        my-8
        overflow-hidden
        flex
        justify-center
        ${className}
      `}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={
          responsive ? "true" : "false"
        }
      />
    </div>
  );
}