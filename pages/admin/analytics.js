import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { checkIfAdmin } from "@/lib/checkAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAnalytics } from "@/lib/admin/getAnalytics";

export default function AnalyticsPage() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      checkIfAdmin(user.uid).then(setIsAdmin);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      getAnalytics().then(setData);
    }
  }, [user, loading, isAdmin]);

  if (loading || (user && !isAdmin)) return <p className="p-6 text-green-400 font-mono">Loading...</p>;
  if (!user || !isAdmin) return <p className="p-6 text-red-600 font-mono">Access Denied</p>;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto font-mono text-green-300">
        <h1 className="text-3xl mb-8 tracking-tight border-b border-green-600 pb-2">
          🧮 System Analytics
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Metric title="👥 USERS" value={data?.users ?? 0} />
          <Metric title="📝 ENTRIES" value={data?.entries ?? 0} />
          <Metric title="💬 COMMENTS" value={data?.comments ?? 0} />
          <Metric title="❤️ LIKES" value={data?.likes ?? 0} />
          <Metric title="👁️ VIEWS" value={data?.views ?? 0} />
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({ title, value }) {
  return (
    <div className="bg-gray-900 border border-green-500 p-5 rounded-md shadow-green-500/20 shadow hover:shadow-lg transition duration-200">
      <div className="text-sm tracking-wide text-lime-400 mb-1">{title}</div>
      <div className="text-4xl font-bold text-emerald-300 tracking-tight">{value}</div>
    </div>
  );
}
