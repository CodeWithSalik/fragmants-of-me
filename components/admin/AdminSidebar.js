import Link from "next/link";
import { useRouter } from "next/router";

const Item = ({ href, label }) => {
  const router = useRouter();
  const active = router.pathname === href;

  return (
    <Link
      href={href}
      className={`block px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition
      ${active
        ? "bg-accent/10 text-accent"
        : "text-ink hover:bg-black/5 dark:hover:bg-white/5"}
      `}
    >
      {label}
    </Link>
  );
};

export default function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl">

      <div className="p-6 border-b border-black/5 dark:border-white/10">
        <h2 className="font-serif text-xl font-bold text-ink">Admin Panel</h2>
      </div>

      <nav className="p-4 space-y-2">

        <Item href="/admin" label="Dashboard" />
        <Item href="/admin/users" label="Users" />
        <Item href="/admin/authors" label="Authors" />
        <Item href="/admin/analytics" label="Analytics" />
        <Item href="/admin/newsletter" label="Newsletter" />
        <Item href="/admin/pins" label="Pins" />
        <Item href="/admin/profile" label="Profile" />
        <Item href="/admin/auth" label="Auth Logs" />

      </nav>
    </aside>
  );
}
