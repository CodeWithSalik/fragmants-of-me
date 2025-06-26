import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Users", path: "/admin/users" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Newsletter", path: "/admin/newsletter" },
    { name: "Pinned Comments", path: "/admin/pins" },
    { name: "Posts", path: "/admin/posts" },
    { name: "Profile", path: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-white border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-amber-700 mb-2">Admin Panel</h2>
        <div className="text-sm text-gray-600 mb-6">
          {currentUser?.displayName || "Admin"}
          <br />
          {currentUser?.email}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-amber-100 text-amber-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
