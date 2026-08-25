import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { doc, getDoc } from "firebase/firestore";

import {
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const [user] = useAuthState(auth);

  const [role, setRole] = useState("user");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const router = useRouter();

  const isAdminRoute =
    router.pathname.startsWith("/admin");

  /*
   * =========================================================
   * USER ROLE
   * =========================================================
   */

  useEffect(() => {
    if (!user) {
      setRole("user");
      return;
    }

    let cancelled = false;

    getDoc(
      doc(db, "users", user.uid)
    )
      .then((snapshot) => {
        if (
          !cancelled &&
          snapshot.exists()
        ) {
          setRole(
            snapshot.data().role ||
              "user"
          );
        }
      })
      .catch((error) => {
        console.error(
          "Failed to load user role:",
          error
        );

        if (!cancelled) {
          setRole("user");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  /*
   * =========================================================
   * BODY SCROLL LOCK
   * =========================================================
   */

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "auto";
    }

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [menuOpen]);

  /*
   * =========================================================
   * CLOSE MENU WHEN ROUTE CHANGES
   * =========================================================
   */

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  /*
   * =========================================================
   * MENU
   * =========================================================
   */

  const toggleMenu = () => {
    setMenuOpen(
      (previous) => !previous
    );
  };

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout = async () => {
    sessionStorage.removeItem(
      "admin_pin_verified"
    );

    try {
      await auth.signOut();

      router.push("/");
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  /*
   * =========================================================
   * NAV LINK
   * =========================================================
   */

  const NavLink = ({
    href,
    children,
    className = "",
  }) => {
    const isActive =
      href === "/"
        ? router.pathname === "/"
        : router.pathname.startsWith(
            href
          );

    return (
      <Link
        href={href}
        onClick={() =>
          setMenuOpen(false)
        }
        className={`nav-link text-[13px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 py-2 px-2 ${
          isActive
            ? "text-accent active"
            : "text-ink hover:text-accent"
        } ${className}`}
      >
        {children}
      </Link>
    );
  };

  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  return (
    <header className="site-header relative z-50">

      <div className="container mx-auto px-4 max-w-[90rem] h-16 md:h-24 flex items-center justify-between">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
        >
          <Image
            src="/logo.png"
            alt="Fragmants"
            width={36}
            height={36}
            priority
          />

          <span className="block text-lg md:text-xl font-serif font-black tracking-tight text-ink hover:text-accent transition-colors">
            Fragmants
          </span>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="hidden md:flex justify-center items-center gap-12 px-7">

          {!isAdminRoute ? (
            <>
              <NavLink href="/">
                Home
              </NavLink>

              <NavLink href="/poems">
                Poems
              </NavLink>

              <NavLink href="/diary">
                Diary
              </NavLink>

              <NavLink href="/monologues">
                Monologues
              </NavLink>

              <NavLink href="/perspectives">
                Perspectives
              </NavLink>

              <NavLink href="/authors">
                Authors
              </NavLink>

              <NavLink href="/private">
                Private
              </NavLink>

              {user && (
                <NavLink href="/saved">
                  Saved
                </NavLink>
              )}

              {(role === "author" ||
                role === "admin") && (
                <NavLink href="/write">
                  Write
                </NavLink>
              )}

              {role === "admin" && (
                <NavLink href="/admin">
                  Admin
                </NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink href="/">
                Home
              </NavLink>

              <NavLink href="/admin">
                Admin
              </NavLink>

              <NavLink href="/quote">
                Quote
              </NavLink>
            </>
          )}

        </nav>

        {/* =================================================
            DESKTOP USER CONTROLS
        ================================================= */}

        <div className="hidden md:flex items-center gap-6">

          {user ? (
            <>
              <div className="relative flex items-center">
                <NotificationDropdown />
              </div>

              <Link
                href="/profile"
                className="text-ink hover:text-accent"
                aria-label="Profile"
              >
                <FiUser size={20} />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-accent text-black dark:bg-accent dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}

        </div>

        {/* =================================================
            MOBILE CONTROLS
        ================================================= */}

        <div className="md:hidden flex items-center gap-4">

          {user && (
            <NotificationDropdown />
          )}

          <button
            type="button"
            onClick={toggleMenu}
            className="text-2xl text-ink hover:text-accent p-2 rounded-lg active:scale-95 transition"
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <FiX />
            ) : (
              <FiMenu />
            )}
          </button>

        </div>

      </div>

      {/* =====================================================
          MOBILE MENU

          No createPortal.
          No typeof window.
          No mounted check.

          Fixed positioning works without a portal.
      ====================================================== */}

      <div
        className={`md:hidden fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-all duration-300 ${
          menuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >

        <div
          className="aura-card w-[90%] max-w-md"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          <div className="aura-card-content p-10 flex flex-col items-center gap-8 relative">

            {/* Close */}

            <button
              type="button"
              onClick={toggleMenu}
              className="absolute top-6 right-6 text-3xl text-ink hover:text-accent"
              aria-label="Close menu"
            >
              <FiX />
            </button>

            {/* =================================================
                MOBILE NAVIGATION
            ================================================= */}

            {!isAdminRoute ? (
              <>
                <NavLink
                  href="/"
                  className="text-xl"
                >
                  Home
                </NavLink>

                <NavLink
                  href="/poems"
                  className="text-xl"
                >
                  Poems
                </NavLink>

                <NavLink
                  href="/diary"
                  className="text-xl"
                >
                  Diary
                </NavLink>

                <NavLink
                  href="/monologues"
                  className="text-xl"
                >
                  Monologues
                </NavLink>

                <NavLink
                  href="/perspectives"
                  className="text-xl"
                >
                  Perspectives
                </NavLink>

                <NavLink
                  href="/authors"
                  className="text-xl"
                >
                  Authors
                </NavLink>

                <NavLink
                  href="/private"
                  className="text-xl"
                >
                  Private
                </NavLink>

                {user && (
                  <NavLink
                    href="/saved"
                    className="text-xl"
                  >
                    Saved
                  </NavLink>
                )}

                {(role === "author" ||
                  role === "admin") && (
                  <NavLink
                    href="/write"
                    className="text-xl"
                  >
                    Write
                  </NavLink>
                )}

                {role === "admin" && (
                  <NavLink
                    href="/admin"
                    className="text-xl"
                  >
                    Admin
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <NavLink
                  href="/"
                  className="text-xl"
                >
                  Home
                </NavLink>

                <NavLink
                  href="/admin"
                  className="text-xl"
                >
                  Admin
                </NavLink>

                <NavLink
                  href="/quote"
                  className="text-xl"
                >
                  Quote
                </NavLink>
              </>
            )}

            {/* Divider */}

            <div className="w-12 h-px bg-black/10 dark:bg-white/10 my-2" />

            {/* =================================================
                MOBILE ACCOUNT
            ================================================= */}

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="text-lg font-serif text-ink"
                >
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="text-red-500 text-lg font-serif"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-primary px-8 py-3"
              >
                Login
              </Link>
            )}

          </div>

        </div>

      </div>

    </header>
  );
}