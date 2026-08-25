import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/lib/auth";
import Head from "next/head";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

/*
 * These controls are not needed for the initial HTML/page render.
 * Loading them separately keeps them out of the critical bundle.
 */
const DarkModeToggle = dynamic(
  () => import("@/components/DarkModeToggle"),
  { ssr: false }
);

const AmbientPlayer = dynamic(
  () => import("@/components/AmbientPlayer"),
  { ssr: false }
);

const ADSENSE_CLIENT = "ca-pub-3631011011308556";

export default function App({ Component, pageProps }) {
  const [showControls, setShowControls] = useState(false);
  const [ambientMood, setAmbientMood] = useState("warm");

  useEffect(() => {
    setShowControls(true);

    const root = document.documentElement;

    const isDark =
      localStorage.getItem("theme") === "dark";

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>

      {/* =========================
          GOOGLE ANALYTICS
      ========================== */}

      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-PC07YVN071"
      />

      <Script
        id="ga-init"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          gtag('js', new Date());
          gtag('config', 'G-PC07YVN071');
        `}
      </Script>

      {/* =========================
          GOOGLE ADSENSE
      ========================== */}

      <Script
        id="adsense-script"
        strategy="lazyOnload"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
      />

      <Head>
        <meta
          name="google-site-verification"
          content="Yf3dKrXllPL5Q6FOqASeZF8fbW3wSlIhS_cDX6h1RhA"
        />

        <meta
          name="google-adsense-account"
          content={ADSENSE_CLIENT}
        />
      </Head>

      {/* Ambient background */}
      <div className="aura" />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-surface)",
            color: "var(--accent)",
            fontWeight: "500",
            border: "1px solid rgba(0,0,0,0.05)",
          },
        }}
      />

      {/* Non-critical floating controls */}
      {showControls && (
        <>
          <DarkModeToggle />
          <AmbientPlayer mood={ambientMood} />
        </>
      )}

      <Layout>
        <main className="min-h-screen page-enter">
          <Component
            {...pageProps}
            setAmbientMood={setAmbientMood}
          />
        </main>

        <Analytics />
      </Layout>

    </AuthProvider>
  );
}