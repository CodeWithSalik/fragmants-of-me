import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { FiUser, FiMenu, FiX } from "react-icons/fi"; // Removed FiBell
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Removed collection/query logic
import { createPortal } from "react-dom";
import Image from "next/image";
import NotificationDropdown from "./NotificationDropdown"; // <--- ONLY NEW IMPORT

export default function Header() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState("user");
  const [menuOpen, setMenuOpen] = useState(false);
  // Removed unreadCount state (handled inside NotificationDropdown now)
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith("/admin");

  useEffect(() => {
    if (!user) {
      setRole("user");
      return;
    }
    getDoc(doc(db, "users", user.uid)).then(s =>
      s.exists() && setRole(s.data().role || "user")
    );
    // Removed the onSnapshot listener for notifications here
  }, [user]);

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

  const NavLink = ({ href, children, className = "" }) => {
    const isActive = router.pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`nav-link text-[13px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 py-2 px-2 ${isActive ? "text-accent active" : "text-ink hover:text-accent"} ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="site-header relative z-50">
      <div className="container mx-auto px-4 max-w-[90rem] h-16 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="Fragmants" width={36} height={36} priority />
          <span className="block text-lg md:text-xl font-serif font-black tracking-tight text-ink hover:text-accent transition-colors">
            Fragmants
          </span>
        </Link>

        <nav className="hidden md:flex justify-center items-center gap-12 px-7">
          {!isAdminRoute ? (
            <>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/poems">Poems</NavLink>
              <NavLink href="/diary">Diary</NavLink>
              <NavLink href="/monologues">Monologues</NavLink>
              <NavLink href="/perspectives">Perspectives</NavLink>
              <NavLink href="/authors">Authors</NavLink>
              <NavLink href="/private">Private</NavLink>
              {/* INTEGRATED SAVED LINK */}
              {user && <NavLink href="/saved">Saved</NavLink>}
              {(role === "author" || role === "admin") && (
                <>
                  <NavLink href="/write">Write</NavLink>
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

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {/* --- REPLACED MANUAL BELL WITH DROPDOWN --- */}
              <div className="relative flex items-center">
                 <NotificationDropdown />
              </div>
              
              <Link href="/profile" className="text-ink hover:text-accent">
                <FiUser size={20} />
              </Link>
              <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="px-6 py-2 rounded-full bg-accent text-black dark:bg-accent dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          {/* Added Dropdown to Mobile View as well */}
          {user && <NotificationDropdown />} 
          
          <button onClick={toggleMenu} className="text-2xl text-ink hover:text-accent p-2 rounded-lg active:scale-95 transition">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {typeof window !== "undefined" &&
        createPortal(
          <div className={`fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-all duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <div className="aura-card w-[90%] max-w-md">
              <div className="aura-card-content p-10 flex flex-col items-center gap-8">
                <button onClick={toggleMenu} className="absolute top-6 right-6 text-3xl text-ink hover:text-accent"><FiX /></button>
                {!isAdminRoute ? (
                  <>
                    <NavLink href="/" className="text-xl">Home</NavLink>
                    <NavLink href="/poems" className="text-xl">Poems</NavLink>
                    <NavLink href="/diary" className="text-xl">Diary</NavLink>
                    <NavLink href="/monologues" className="text-xl">Monologues</NavLink>
                    <NavLink href="/perspectives" className="text-xl">Perspectives</NavLink>
                    <NavLink href="/authors" className="text-xl">Authors</NavLink>
                    <NavLink href="/private" className="text-xl">Private</NavLink>

                    {/* MOBILE SAVED LINK */}
                    {user && <NavLink href="/saved" className="text-xl">Saved</NavLink>}
                    {(role === "author" || role === "admin") && <NavLink href="/write" className="text-xl">Write</NavLink>}
                    {role === "admin" && <NavLink href="/admin" className="text-xl">Admin</NavLink>}
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
                    <Link href="/profile" className="text-lg font-serif text-ink">My Profile</Link>
                    <button onClick={handleLogout} className="text-red-500 text-lg font-serif">Logout</button>
                  </>
                ) : (
                  <Link href="/login" className="btn-primary px-8 py-3">Login</Link>
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