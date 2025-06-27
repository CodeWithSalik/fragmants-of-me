import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { checkIfAdmin } from "@/lib/checkAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { getDocs, collection, query, where } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const router = useRouter();

  // 🔐 Verify admin + PIN
  useEffect(() => {
    const verify = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() ? snap.data().role : null;

      if (role !== "admin") {
        toast.error("Access denied");
        router.push("/");
        return;
      }

      const verified = sessionStorage.getItem("admin_pin_verified") === "true";
      if (!verified) {
        router.push("/admin/auth");
        return;
      }

      setIsAdmin(true);
    };

    if (!loading) verify();
  }, [user, loading]);

  // 🔢 Count entries authored by this admin
  useEffect(() => {
    if (user && isAdmin) {
      const fetchEntryCount = async () => {
        const q = query(collection(db, "entries"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        setEntryCount(snap.size);
      };
      fetchEntryCount();
    }
  }, [user, isAdmin]);

  if (loading || !user || !isAdmin) return <p className="p-6">Loading...</p>;

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-[#0b0f0e] text-green-400 font-mono p-6 rounded-lg shadow border border-green-600">
        <h1 className="text-3xl font-bold mb-6 border-b border-green-500 pb-2">👤 Admin Profile</h1>
        <div className="space-y-3">
          <div>
            <span className="text-green-500">🧑 Name:</span> {user.displayName || "Anonymous"}
          </div>
          <div>
            <span className="text-green-500">📧 Email:</span> {user.email}
          </div>
          <div>
            <span className="text-green-500">🆔 UID:</span>{" "}
            <code className="text-xs bg-green-800 px-1 py-0.5 rounded">{user.uid}</code>
          </div>
          <div>
            <span className="text-green-500">🔐 Role:</span> Admin
          </div>
          <div>
            <span className="text-green-500">📦 Total Entries Posted:</span> {entryCount}
          </div>
          <div>
            <span className="text-green-500">⏰ Last Login:</span>{" "}
            {user.metadata?.lastSignInTime
              ? new Date(user.metadata.lastSignInTime).toLocaleString()
              : "N/A"}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
