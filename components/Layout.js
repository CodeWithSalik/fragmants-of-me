import Header from "./Header";
import Footer from "./Footer";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const LoginRegisterModal = dynamic(
  () => import("./LoginRegisterModal"),
  { ssr: false }
);

export default function Layout({ children }) {
  const [user, loading] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => setShowModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  useEffect(() => {
    const handleRouteChange = () => setShowModal(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      {showModal && <LoginRegisterModal onClose={() => setShowModal(false)} />}

      <main
        className={`flex-grow w-full transition-opacity duration-500 ${showModal ? "opacity-80" : "opacity-100"
          }`}
      >

        {children}
      </main>

      <Footer />
    </div>
  );
}