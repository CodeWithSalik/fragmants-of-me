import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAllUsers } from "@/lib/admin/getAllUsers";
import { promoteToAdmin } from "@/lib/admin/promoteToAdmin";
import { deleteUser } from "@/lib/admin/deleteUser";
import { toast } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

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

  const toggleRole = async (uid, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await promoteToAdmin(uid, newRole);
      toast.success(`✅ Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update role");
    }
  };

  const handleDelete = async (uid) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await deleteUser(uid);
      toast.success("🗑️ User deleted");
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete user");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-400 mb-6 border-b border-green-500 pb-2 font-mono">
          👥 Manage Users
        </h1>

        {loading ? (
          <p className="text-green-300 font-mono">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 font-mono">No users found.</p>
        ) : (
          <div className="overflow-x-auto border border-green-600 rounded bg-[#0d1117] text-green-300 font-mono shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-[#161b22] text-green-400 border-b border-green-700">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-t border-green-800 hover:bg-[#1c1f24]">
                    <td className="px-4 py-2">{u.name || "Unknown"}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.mobile || "—"}</td>
                    <td className="px-4 py-2 capitalize">{u.role}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => toggleRole(u.uid, u.role)}
                        className="px-2 py-1 text-xs bg-green-700 hover:bg-green-600 rounded text-white"
                      >
                        Make {u.role === "admin" ? "User" : "Admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.uid)}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
