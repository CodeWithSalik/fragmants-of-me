// pages/_app.js
import "@/styles/globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { pingBackend } from "@/lib/pingBackend";
import { AuthProvider } from "@/lib/auth";
import DarkModeToggle from "@/components/DarkModeToggle";
import Head from "next/head"; // ✅ Import Head from next/head

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [showDarkToggle, setShowDarkToggle] = useState(false);

  useEffect(() => {
    pingBackend(); // 🔄 Initial ping

    // Show dark toggle only on homepage
    setShowDarkToggle(router.pathname === "/");

    // Apply dark mode from localStorage (persisted user setting)
    const root = document.documentElement;
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    document.body.classList.add("bg-parchment", "text-ink");
  }, [router.pathname]);

  return (
    <AuthProvider>
      <Head>
        {/* ✅ Google AdSense script for Auto Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3631011011308556"
          crossOrigin="anonymous"
        ></script>
      </Head>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fef3c7",
            color: "#92400e",
            fontWeight: "500",
          },
        }}
      />

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
            <Component {...pageProps} />
            {showDarkToggle && <DarkModeToggle />}
          </motion.main>
        </AnimatePresence>
      </Layout>
    </AuthProvider>
  );
}
