import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { FiUser, FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { checkIfAdmin } from "@/lib/checkAdmin";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    if (user?.uid) {
      checkIfAdmin(user.uid).then((res) => {
        if (active) setIsAdmin(res);
      });
    } else {
      setIsAdmin(false);
    }
    return () => {
      active = false;
    };
  }, [user]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pin_verified");
    auth.signOut();
    router.push("/");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  const linkStyle =
    "block py-2 px-4 text-sm sm:text-base text-ink dark:text-[#fefae0] hover:text-amber-dark dark:hover:text-[#fcd34d] transition";

  return (
    <header className="bg-parchment dark:bg-[#29241c] border-b border-amber-light dark:border-[#4d3f2d] shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between sm:justify-start relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-20 sm:mr-6">
          <img src="/logo.png" alt="Fragments of Me" className="h-8 sm:h-10" />
        </Link>

        {/* Title on mobile */}
        <div className="absolute left-1/2 transform -translate-x-1/2 sm:hidden">
          <span className="text-base italic text-amber-dark dark:text-[#fcdca1] font-semibold">
            Fragments of Me
          </span>
        </div>

        {/* Hamburger toggle */}
        <div className="sm:hidden z-20">
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="text-2xl text-amber-dark dark:text-[#fcdca1] focus:outline-none"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`${menuOpen ? "max-h-[500px]" : "max-h-0"
            } sm:max-h-none sm:flex flex-col sm:flex-row overflow-hidden sm:overflow-visible transition-all duration-300 ease-in-out gap-2 sm:gap-6 absolute sm:static top-full left-0 right-0 bg-parchment dark:bg-[#29241c] sm:bg-transparent px-4 sm:px-0 border-t sm:border-none`}
        >
          <Link href="/" className={linkStyle}>Home</Link>

          {user && (
            <>
              <Link href="/poems" className={linkStyle}>Poems</Link>
              <Link href="/diary" className={linkStyle}>Diary</Link>
              <Link href="/monologues" className={linkStyle}>Monologues</Link>
            </>
          )}

          {user && (
            <Link href="/profile" className="text-xl sm:text-base text-ink dark:text-[#fefae0] hover:text-amber-dark dark:hover:text-[#fcd34d] px-4 sm:px-0">
              <FiUser />
            </Link>
          )}

          {isAdmin && (
            <>
              <Link href="/write" className={linkStyle}>Write</Link>
              <Link href="/private" className={linkStyle}>Private</Link>
              <Link href="/quote" className={linkStyle}>Edit Quote</Link>
              <Link href="/admin" className={linkStyle}>Admin Panel</Link>
            </>
          )}

          {!user ? (
            <Link href="/login" className="text-amber hover:underline px-4 sm:px-0 text-sm sm:text-base">
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-500 dark:text-red-400 hover:underline text-sm sm:text-base px-4 sm:px-0"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
