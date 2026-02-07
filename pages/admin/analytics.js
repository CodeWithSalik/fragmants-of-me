import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import AdminLayout from "@/components/admin/AdminLayout";
import { FiUsers, FiFileText, FiMessageSquare, FiHeart, FiEye, FiBarChart2, FiArrowUpRight, FiUserPlus } from "react-icons/fi";
import Link from "next/link";

export default function AnalyticsPage() {
  const [user, loading] = useAuthState(auth);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    const fetchData = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Analytics Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, loading]);

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-screen text-muted">Loading analytics...</div>
    </AdminLayout>
  );

  const stats = data?.stats || {};
  const topContent = data?.topContent || [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-ink mb-8 border-b border-black/5 dark:border-white/5 pb-4">
          Platform Analytics
        </h1>

        {/* --- 1. SUMMARY CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <MetricCard icon={<FiUsers />} title="Users" value={stats.users ?? 0} color="text-blue-500" />
          <MetricCard icon={<FiUserPlus />} title="Followers" value={stats.followers ?? 0} color="text-pink-500" />
          <MetricCard icon={<FiFileText />} title="Entries" value={stats.entries ?? 0} color="text-emerald-500" />
          <MetricCard icon={<FiMessageSquare />} title="Comments" value={stats.comments ?? 0} color="text-amber-500" />
          <MetricCard icon={<FiHeart />} title="Likes" value={stats.likes ?? 0} color="text-red-500" />
          <MetricCard icon={<FiEye />} title="Views" value={stats.views ?? 0} color="text-purple-500" />
        </div>

        {/* --- 2. TOP CONTENT TABLE --- */}
        <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-8 border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <FiBarChart2 className="text-accent text-xl" />
            <h2 className="text-xl font-bold text-ink">Top Performing Content</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-widest text-muted">
                  <th className="pb-4 pl-4">Title</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Author</th>
                  <th className="pb-4 text-right">Likes</th>
                  <th className="pb-4 text-right pr-4">Views</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topContent.map((item, i) => (
                  <tr key={item.id} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4 font-serif font-medium text-ink flex items-center gap-3">
                      <span className="text-muted/50 text-xs w-4">{(i + 1).toString().padStart(2, '0')}</span>
                      {item.title}
                      <Link href={`/entry/${item.id}`} target="_blank" className="opacity-0 group-hover:opacity-100 text-accent transition-opacity">
                        <FiArrowUpRight />
                      </Link>
                    </td>
                    <td className="py-4 text-muted capitalize">{item.type}</td>
                    <td className="py-4 text-muted">{item.author}</td>
                    
                    {/* NEW LIKES COLUMN */}
                    <td className="py-4 text-right font-bold text-ink">
                       <span className="flex items-center justify-end gap-1 text-red-500/80">
                         <FiHeart size={12} className="fill-current" /> {item.likes.toLocaleString()}
                       </span>
                    </td>

                    <td className="py-4 pr-4 text-right font-bold text-ink">
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full text-xs">
                         {item.views.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {topContent.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-muted italic">No content data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ icon, title, value, color }) {
  return (
    <div className="aura-card reading-mode h-full">
      <div className="aura-card-content p-4 flex flex-col items-center text-center justify-center h-full">
        <div className={`p-3 rounded-full bg-black/5 dark:bg-white/5 text-xl mb-2 ${color}`}>
          {icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-1">{title}</p>
        <p className="text-2xl font-mono font-bold text-ink">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}