import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { FiUser, FiMenu, FiX, FiBell } from "react-icons/fi";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { createPortal } from "react-dom";

export default function Header() {

  const [user] = useAuthState(auth);
  const [role, setRole] = useState("user");
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith("/admin");

  /* ================= AUTH + ROLE ================= */

  useEffect(() => {
    if (!user) {
      setRole("user");
      setUnreadCount(0);
      return;
    }

    getDoc(doc(db, "users", user.uid)).then(s =>
      s.exists() && setRole(s.data().role || "user")
    );

    const unsub = onSnapshot(
      query(
        collection(db, "users", user.uid, "notifications"),
        where("read", "==", false)
      ),
      (s) => setUnreadCount(s.size)
    );

    return () => unsub();
  }, [user]);

  /* ================= MENU BEHAVIOR ================= */

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pin_verified");
    auth.signOut();
    router.push("/");
  };

  /* ================= NAV LINK ================= */

  const NavLink = ({ href, children, className = "" }) => {
    const isActive = router.pathname.startsWith(href);

    return (
      <Link
        href={href}
        className={`
          nav-link
          text-[13px] font-semibold tracking-[0.12em] uppercase
          transition-all duration-300
          py-2 px-2
          ${isActive ? "text-accent active" : "text-ink hover:text-accent"}
          ${className}
        `}
      >
        {children}
      </Link>
    );
  };

  /* ================================================= */

  return (
    <header className="site-header">

      {/* ================= TOP BAR ================= */}

      <div className="container mx-auto px-4 max-w-[90rem] h-16 md:h-24 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo.png"
            alt="Fragments"
            className="h-8 md:h-9 w-auto opacity-90 hover:scale-105 transition-transform"
          />
          <span className="block text-lg md:text-xl font-serif font-black tracking-tight text-ink hover:text-accent transition-colors">
            Fragments
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex justify-center items-center gap-12">

          {!isAdminRoute ? (
            <>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/poems">Poems</NavLink>
              <NavLink href="/diary">Diary</NavLink>
              <NavLink href="/monologues">Monologues</NavLink>
              <NavLink href="/authors">Authors</NavLink>

              {(role === "author" || role === "admin") && (
                <>
                  <NavLink href="/write">Write</NavLink>
                  <NavLink href="/private">Private</NavLink>
                </>
              )}

              {role === "admin" && <NavLink href="/admin">Admin</NavLink>}
            </>
          ) : (
            <>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/admin">Admin</NavLink>
              <NavLink href="/quote">Quote</NavLink>
            </>
          )}

        </nav>

        {/* RIGHT ICONS (DESKTOP) */}
        <div className="hidden md:flex items-center gap-6">

          {user ? (
            <>
              <div className="relative">
                <Link href="/notifications" className="text-ink hover:text-accent">
                  <FiBell size={20} />
                </Link>

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-3 w-3 flex items-center justify-center rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>

              <Link href="/profile" className="text-ink hover:text-accent">
                <FiUser size={20} />
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-ink text-white dark:bg-accent dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}

        </div>

        {/* MOBILE HAMBURGER */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-2xl text-ink hover:text-accent p-2 rounded-lg active:scale-95 transition"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

      </div>

      {/* ================= MOBILE MENU ================= */}

      {typeof window !== "undefined" &&
        createPortal(

          <div
            className={`
              fixed inset-0 z-[9999]
              bg-black/30 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-300
              ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
          >

            <div className="aura-card w-[90%] max-w-md">
              <div className="aura-card-content p-10 flex flex-col items-center gap-8">

                <button
                  onClick={toggleMenu}
                  className="absolute top-6 right-6 text-3xl text-ink hover:text-accent"
                >
                  <FiX />
                </button>

                {!isAdminRoute ? (
                  <>
                    <NavLink href="/" className="text-xl">Home</NavLink>
                    <NavLink href="/poems" className="text-xl">Poems</NavLink>
                    <NavLink href="/diary" className="text-xl">Diary</NavLink>
                    <NavLink href="/monologues" className="text-xl">Monologues</NavLink>
                    <NavLink href="/authors" className="text-xl">Authors</NavLink>

                    {(role === "author" || role === "admin") && (
                      <NavLink href="/write" className="text-xl">Write</NavLink>
                    )}

                    {role === "admin" && (
                      <NavLink href="/admin" className="text-xl">Admin</NavLink>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink href="/" className="text-xl">Home</NavLink>
                    <NavLink href="/admin" className="text-xl">Admin</NavLink>
                  </>
                )}

                <div className="w-12 h-px bg-black/10 dark:bg-white/10 my-2" />

                {user ? (
                  <>
                    <Link href="/profile" className="text-lg font-serif text-ink">
                      My Profile
                    </Link>

                    <button onClick={handleLogout} className="text-red-500 text-lg font-serif">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="btn-primary px-8 py-3">
                    Login
                  </Link>
                )}

              </div>
            </div>

          </div>,
          document.body
        )
      }

    </header>
  );
}
