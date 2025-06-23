// components/Layout.js
import Header from "./Header";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoginRegisterModal from "./LoginRegisterModal";

export default function Layout({ children }) {
  const [user, loading] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Show popup after delay if not logged in
  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => setShowModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  // Auto-close modal on route change
  useEffect(() => {
    const handleRouteChange = () => setShowModal(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col">
      <Header />
      {showModal && <LoginRegisterModal onClose={() => setShowModal(false)} />}
      <main
        className={`flex-grow max-w-3xl mx-auto pt-10 pb-20 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${showModal ? "blur-sm pointer-events-none select-none" : ""
          }`}
      >
        {children}
      </main>
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-amber-light">
        © {new Date().getFullYear()} Fragments of Me — Crafted by{" "}
        <span className="font-semibold text-amber-dark">Salik Pirzada</span> @{" "}
        <span className="text-amber-dark">CodeWithSalik</span>
      </footer>
    </div>
  );
}
