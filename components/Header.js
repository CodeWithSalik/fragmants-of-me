// components/Header.js
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { FiUser, FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Header() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const isAdmin = user?.uid === "SIpfZSIJM5RKrvLahp7I4DLwiE93";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Auto-close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  const linkStyle =
    "block py-2 px-4 text-sm sm:text-base text-ink hover:text-amber-dark transition";

  return (
    <header className="bg-[#fdf6e3] border-b border-amber-light shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Fragments of Me" className="h-8 sm:h-10" />
        </Link>

        {/* Hamburger toggle (Mobile only) */}
        <div className="sm:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="text-2xl text-amber-dark focus:outline-none"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`${menuOpen ? "max-h-[500px]" : "max-h-0"
            } sm:max-h-none sm:flex flex-col sm:flex-row overflow-hidden sm:overflow-visible transition-all duration-300 ease-in-out gap-2 sm:gap-6 absolute sm:static top-full left-0 right-0 bg-[#fdf6e3] sm:bg-transparent px-4 sm:px-0 border-t sm:border-none`}
        >
          <Link href="/" className={linkStyle}>
            Home
          </Link>
          <Link href="/archive" className={linkStyle}>
            Archive
          </Link>

          {user && (
            <>
              <Link href="/poems" className={linkStyle}>
                Poems
              </Link>
              <Link href="/diary" className={linkStyle}>
                Diary
              </Link>
              <Link href="/monologues" className={linkStyle}>
                Monologues
              </Link>
            </>
          )}

          {user && (
            <Link href="/profile" className="text-xl sm:text-base text-ink hover:text-amber-dark px-4 sm:px-0">
              <FiUser />
            </Link>
          )}

          {isAdmin && (
            <>
              <Link href="/write" className={linkStyle}>
                Write
              </Link>
              <Link href="/private" className={linkStyle}>
                Private
              </Link>
              <Link href="/quote" className={linkStyle}>
                Edit Quote
              </Link>
            </>
          )}

          {!user ? (
            <Link href="/login" className="text-amber hover:underline px-4 sm:px-0 text-sm sm:text-base">
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline text-sm sm:text-base px-4 sm:px-0"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
