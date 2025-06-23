// pages/_app.js
import "@/styles/globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { pingBackend } from "@/lib/pingBackend";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add("bg-parchment", "text-ink");
   pingBackend(); // 👈 ping once when app starts
  }, []);

  return (
    <>
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
          >
            <Component {...pageProps} />
          </motion.main>
        </AnimatePresence>
      </Layout>
    </>
  );
}
