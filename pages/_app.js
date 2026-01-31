import "@/styles/globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { pingBackend } from "@/lib/pingBackend";
import { AuthProvider } from "@/lib/auth";
import DarkModeToggle from "@/components/DarkModeToggle";
import AmbientPlayer from "@/components/AmbientPlayer";
import Head from "next/head";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [showControls, setShowControls] = useState(false);
  const [ambientMood, setAmbientMood] = useState("warm");

  useEffect(() => {
    pingBackend();
    setShowControls(true); 

    const root = document.documentElement;
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
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
      
      {/* --- ADSENSE INTEGRATION --- */}
      <Head>
        <meta name="google-adsense-account" content="ca-pub-4872587981884740" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4872587981884740" 
          crossOrigin="anonymous"
        ></script>
      </Head>
      {/* --------------------------- */}

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
      </Layout>
    </AuthProvider>
  );
}