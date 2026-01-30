import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    const ok = sessionStorage.getItem("admin_pin_verified");
    if (ok !== "true") router.push("/admin/auth");
  }, [router]);

  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Users", path: "/admin/users" },
    { name: "Authors", path: "/admin/authors" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Newsletter", path: "/admin/newsletter" },
    { name: "Pins", path: "/admin/pins" },
    { name: "Profile", path: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen flex bg-parchment dark:bg-[#0a0a0a]">

      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col bg-white/40 dark:bg-white/5 backdrop-blur-xl
        border-r border-black/5 dark:border-white/10 p-6">

        <h2 className="text-2xl font-serif font-bold text-ink mb-2">
          Admin Panel
        </h2>

        <div className="text-xs text-muted mb-6">
          {currentUser?.email}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = router.pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition
                  ${active
                    ? "bg-accent/10 text-accent"
                    : "text-ink hover:bg-black/5 dark:hover:bg-white/5"}
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
