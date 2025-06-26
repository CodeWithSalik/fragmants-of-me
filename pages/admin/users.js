// pages/admin/users.js
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
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const toggleRole = async (uid, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await promoteToAdmin(uid, newRole);
      toast.success(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (uid) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await deleteUser(uid);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Mobile</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-t text-sm">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.mobile}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => toggleRole(u.uid, u.role)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      Make {u.role === "admin" ? "User" : "Admin"}
                    </button>
                    <button
                      onClick={() => handleDelete(u.uid)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
