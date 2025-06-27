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
    { name: "Profile", path: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen flex bg-black text-green-300 font-mono">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col bg-gray-900 border-r border-gray-700 p-6 shadow-2xl">
        <h2 className="text-3xl font-bold text-emerald-400 mb-4 tracking-tight">
          ⌬ Admin Portal
        </h2>

        <div className="text-xs text-gray-400 mb-6">
          {currentUser?.displayName || "Unknown Hacker"}
          <br />
          {currentUser?.email}
        </div>

        <nav className="space-y-2 text-sm">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`block px-4 py-2 rounded-md transition duration-200 ${
                  isActive
                    ? "bg-emerald-600 text-black shadow-lg"
                    : "hover:bg-emerald-800 hover:text-white"
                }`}
              >
                {`> ${item.name}`}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 text-xs text-gray-500">
          System: Online<br />
          Access: Root
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-gray-950 text-green-200 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
