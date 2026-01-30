import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { checkIfAdmin } from "@/lib/checkAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";
import { FiShield, FiMail, FiPackage, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.data()?.role !== "admin") return router.push("/");
      
      const verified = sessionStorage.getItem("admin_pin_verified") === "true";
      if (!verified) return router.push("/admin/auth");

      setIsAdmin(true);
    };
    if (!loading) verify();
  }, [user, loading, router]);

  useEffect(() => {
    if (user && isAdmin) {
      const q = query(collection(db, "entries"), where("uid", "==", user.uid));
      getDocs(q).then(snap => setEntryCount(snap.size));
    }
  }, [user, isAdmin]);

  if (loading || !isAdmin) return <div className="p-10 text-center text-muted">Loading...</div>;

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="aura-card reading-mode">
          <div className="aura-card-content p-10">
            
            <div className="flex items-center gap-6 mb-8 border-b border-black/5 dark:border-white/5 pb-6">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl shadow-lg">
                <FiShield />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">Administrator</h1>
                <p className="text-muted text-sm">{user.displayName || "System Admin"}</p>
              </div>
            </div>

            <div className="space-y-6">
              <InfoRow icon={<FiMail />} label="Email" value={user.email} />
              <InfoRow icon={<FiPackage />} label="Total Posts" value={entryCount} />
              <InfoRow icon={<FiClock />} label="Last Login" value={user.metadata.lastSignInTime} />
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 text-ink/80">
      <div className="text-accent text-lg opacity-70">{icon}</div>
      <div className="flex-grow">
        <p className="text-xs font-bold uppercase tracking-widest text-muted/60">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}