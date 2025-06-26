// pages/admin/profile.js
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { checkIfAdmin } from "@/lib/checkAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { getDocs, collection, query, where } from "firebase/firestore";

export default function AdminProfile() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      checkIfAdmin(user.uid).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      const fetchEntryCount = async () => {
        const q = query(collection(db, "entries"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        setEntryCount(snap.size);
      };
      fetchEntryCount();
    }
  }, [user, isAdmin, loading]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !isAdmin) return <p className="p-6 text-red-600">Access Denied</p>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-dark">👤 Admin Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow border border-amber-light max-w-xl space-y-4">
        <div>
          <span className="font-semibold">Name:</span> {user.displayName || "Anonymous"}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-semibold">UID:</span> <code className="text-xs">{user.uid}</code>
        </div>
        <div>
          <span className="font-semibold">Role:</span> Admin
        </div>
        <div>
          <span className="font-semibold">Total Entries Posted:</span> {entryCount}
        </div>
        <div>
          <span className="font-semibold">Last Login:</span>{" "}
          {user.metadata?.lastSignInTime
            ? new Date(user.metadata.lastSignInTime).toLocaleString()
            : "N/A"}
        </div>
      </div>
    </AdminLayout>
  );
}
