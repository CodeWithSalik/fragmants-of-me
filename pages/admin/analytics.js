import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { checkIfAdmin } from "@/lib/checkAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAnalytics } from "@/lib/admin/getAnalytics";
import { FiUsers, FiFileText, FiMessageSquare, FiHeart, FiEye } from "react-icons/fi";

export default function AnalyticsPage() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) checkIfAdmin(user.uid).then(setIsAdmin);
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && isAdmin) getAnalytics().then(setData);
  }, [user, loading, isAdmin]);

  if (loading || (user && !isAdmin)) return <div className="p-10 text-center text-muted">Loading analytics...</div>;
  if (!user || !isAdmin) return <div className="p-10 text-center text-red-500">Access Denied</div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-ink mb-8 border-b border-black/5 dark:border-white/5 pb-4">
          Platform Analytics
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <MetricCard icon={<FiUsers />} title="Total Users" value={data?.users ?? 0} color="text-blue-500" />
          <MetricCard icon={<FiFileText />} title="Published Entries" value={data?.entries ?? 0} color="text-emerald-500" />
          <MetricCard icon={<FiMessageSquare />} title="Comments" value={data?.comments ?? 0} color="text-amber-500" />
          <MetricCard icon={<FiHeart />} title="Total Likes" value={data?.likes ?? 0} color="text-red-500" />
          <MetricCard icon={<FiEye />} title="Total Views" value={data?.views ?? 0} color="text-purple-500" />
        </div>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ icon, title, value, color }) {
  return (
    <div className="aura-card reading-mode">
      <div className="aura-card-content p-6 flex items-center gap-5">
        <div className={`p-4 rounded-full bg-black/5 dark:bg-white/5 text-2xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted/60 mb-1">{title}</p>
          <p className="text-4xl font-mono font-bold text-ink">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}