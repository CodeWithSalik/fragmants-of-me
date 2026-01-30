import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/admin/getAllUsers";
import { updateUserRole } from "@/lib/admin/updateUserRole";
import { deleteUser } from "@/lib/admin/deleteUser";
import { toast } from "react-hot-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/router";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.data()?.role !== "admin") router.push("/");
      else loadUsers();
    };
    check();
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (uid, newRole) => {
    if (uid === user.uid && newRole !== "admin") {
      toast.error("You cannot remove your own admin role");
      return;
    }
    try {
      await updateUserRole(uid, newRole);
      toast.success(`Role updated to ${newRole}`);
      loadUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (uid) => {
    if (!confirm("Delete user?")) return;
    await deleteUser(uid);
    toast.success("User deleted");
    loadUsers();
  };

  if (loading) return <div className="p-10 text-center text-muted">Loading users...</div>;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-parchment dark:bg-[#0a0a0a] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-ink mb-8">User Management</h1>

          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/5 dark:bg-white/5 text-xs uppercase tracking-widest text-muted font-bold">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-ink">{u.name || "Anonymous"}</td>
                      <td className="p-4 text-muted">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.uid, e.target.value)}
                          className="bg-transparent
  dark:bg-black
  text-ink
  dark:text-white
  border border-black/10 dark:border-white/20
  rounded px-2 py-1
  text-xs font-bold uppercase"
                        >
                          <option value="user" className="bg-black text-white">User</option>
                          <option value="author" className="bg-black text-white">Author</option>
                          <option value="admin" className="bg-black text-white">Admin</option>
                        </select>
                      </td>

                      <td className="p-4 text-right space-x-2">

                        <button
                          onClick={() => handleDelete(u.uid)}
                          className="text-red-500 hover:underline text-xs font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}