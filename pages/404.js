/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { motion } from "framer-motion";

export default function Custom404() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-parchment dark:bg-[#1e1b16] text-ink dark:text-[#fefae0] px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-6xl font-bold text-amber-dark dark:text-amber-300 mb-4">404</h1>
      <p className="text-xl font-serif italic mb-6 max-w-xl text-gray-700 dark:text-[#d4cfc7]">
        The page you seek has not yet been written — perhaps it's still a whisper in your heart.
      </p>
      <Link href="/">
        <button className="px-6 py-2 bg-amber text-white rounded hover:bg-amber-dark transition">
          Return to Fragments
        </button>
      </Link>
    </motion.div>
  );
}
