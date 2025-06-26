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

  // ✅ Hook always called
  useEffect(() => {
    if (!loading && user) {
      checkIfAdmin(user.uid).then((result) => {
        setIsAdmin(result);
      });
    }
  }, [user, loading]);

  // ✅ Hook always called
  useEffect(() => {
    if (!loading && user && isAdmin) {
      getAnalytics().then(setData);
    }
  }, [user, loading, isAdmin]);

  if (loading || (user && isAdmin === false)) return <p className="p-6">Loading...</p>;
  if (!user || !isAdmin) return <p className="p-6 text-red-600">Access Denied</p>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-dark mb-6">📊 Analytics Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Metric title="👥 Users" value={data?.users ?? 0} />
          <Metric title="📝 Entries" value={data?.entries ?? 0} />
          <Metric title="💬 Comments" value={data?.comments ?? 0} />
          <Metric title="❤️ Likes" value={data?.likes ?? 0} />
          <Metric title="👁️ Views" value={data?.views ?? 0} />
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-6 border border-amber-light">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-amber-dark">{value}</div>
    </div>
  );
}
