import "@/styles/globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
// REMOVED: import { pingBackend } from "@/lib/pingBackend"; 
import { AuthProvider } from "@/lib/auth";
import DarkModeToggle from "@/components/DarkModeToggle";
import AmbientPlayer from "@/components/AmbientPlayer";
import Head from "next/head";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { isFirebaseConfigured } from "@/lib/firebase";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";


export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [showControls, setShowControls] = useState(false);
  const [ambientMood, setAmbientMood] = useState("warm");

  useEffect(() => {
    // REMOVED: pingBackend(); 
    setShowControls(true);

    const root = document.documentElement;
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);


  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold mb-3">Configuration Error</h1>
          <p className="text-muted">
            Firebase client environment variables are missing. Set NEXT_PUBLIC_FIREBASE_API_KEY,
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            and NEXT_PUBLIC_FIREBASE_APP_ID in Vercel project settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      {/* --- GOOGLE ANALYTICS --- */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-PC07YVN071"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PC07YVN071');
        `}
      </Script>

      {/* --- ADSTERRA SOCIAL BAR --- */}
      <Script 
        src="https://pl28622114.effectivegatecpm.com/02/6b/23/026b2358b3ab017ec68abf3e0a32f689.js"
        strategy="lazyOnload" 
      />

      {/* --- ADSENSE & VERIFICATION --- */}
      <Head>
        <meta name="google-site-verification" content="Yf3dKrXllPL5Q6FOqASeZF8fbW3wSlIhS_cDX6h1RhA" />
        <meta name="google-adsense-account" content="ca-pub-4872587981884740" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta property="og:site_name" content={SITE_NAME} />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS`} href={`${SITE_URL}/rss.xml`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4872587981884740"
          crossOrigin="anonymous"
        ></script>
      </Head>

      <div className="aura" />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-surface)",
            color: "var(--accent)",
            fontWeight: "500",
            border: "1px solid rgba(0,0,0,0.05)"
          },
        }}
      />

      {showControls && (
        <>
          <DarkModeToggle />
          <AmbientPlayer mood={ambientMood} />
        </>
      )}

      <Layout>
        <AnimatePresence mode="wait">
          <motion.main
            key={router.route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <Component {...pageProps} setAmbientMood={setAmbientMood} />
          </motion.main>
        </AnimatePresence>
           <Analytics />
      </Layout>
    </AuthProvider>
  );
}