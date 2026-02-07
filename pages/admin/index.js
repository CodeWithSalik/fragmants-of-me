import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { FiUsers, FiFileText, FiLock, FiMessageSquare, FiEye, FiActivity, FiTrendingUp, FiRefreshCw } from "react-icons/fi"; // Added FiRefreshCw
import Link from "next/link";
import toast from "react-hot-toast"; // Import Toast

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // New State for loading
  const router = useRouter();

  // ... (Keep existing useEffect for fetching data) ...
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }

    const fetchData = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user, loading, router]);

  // --- NEW: Handle Sync ---
  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing database stats...");
    
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/sync-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Synced ${data.updated} entries!`, { id: toastId });
        // Refresh the page to see new numbers
        router.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Sync failed", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading || isLoadingData) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-screen text-muted">Thinking...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-ink mb-2">Dashboard</h1>
        <p className="text-muted mb-8">Welcome back, Admin.</p>

        {/* ... (Keep Stats Grid and Recent Activity as is) ... */}
        
        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<FiUsers />} label="Total Users" value={stats?.users} />
          <StatCard icon={<FiFileText />} label="Total Entries" value={stats?.entries} />
          <StatCard icon={<FiMessageSquare />} label="Total Comments" value={stats?.comments} />
          <StatCard icon={<FiEye />} label="Total Views" value={stats?.views} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Recent Activity Feed (Keep existing code) */}
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-8 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <FiActivity className="text-accent" />
              <h2 className="text-xl font-bold text-ink">Recent Activity</h2>
            </div>
            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <p className="text-muted italic">No recent activity.</p>
              ) : (
                recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4 items-start pb-6 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-accent shrink-0" />
                    <div>
                      <p className="text-sm text-ink">
                        <span className="font-bold">{act.author}</span> commented:
                      </p>
                      <p className="text-sm text-muted italic line-clamp-2 my-1">"{act.content}"</p>
                      <Link href={`/entry/${act.entryId}`} className="text-[10px] uppercase tracking-widest text-accent hover:underline">
                        View Entry
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- CONTENT BREAKDOWN & ACTIONS --- */}
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-8 border border-black/5 dark:border-white/5 h-fit">
             <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FiTrendingUp className="text-green-500" />
                <h2 className="text-xl font-bold text-ink">Content Breakdown</h2>
              </div>
              
              {/* --- NEW SYNC BUTTON --- */}
              <button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-muted hover:text-accent disabled:opacity-50"
                title="Recalculate View Counts"
              >
                <FiRefreshCw className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing..." : "Sync Stats"}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/40 dark:bg-black/40 rounded-xl">
                <span className="text-sm font-bold text-muted">Public Fragments</span>
                <span className="text-lg font-bold text-ink">{stats?.public}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/40 dark:bg-black/40 rounded-xl">
                <span className="text-sm font-bold text-muted">Private Fragments</span>
                <span className="text-lg font-bold text-ink flex items-center gap-2">
                  <FiLock size={14} /> {stats?.private}
                </span>
              </div>
            </div>
             <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
               <Link href="/write" className="w-full block text-center bg-ink text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform">
                 Compose New Fragment
               </Link>
             </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

// (Keep StatCard component as is)
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/50 dark:bg-black/20 p-6 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center hover:bg-white/80 dark:hover:bg-white/5 transition-colors">
      <div className="text-accent mb-3 text-2xl">{icon}</div>
      <div className="text-3xl font-serif font-bold text-ink mb-1">{value?.toLocaleString() || 0}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
    </div>
  );
}