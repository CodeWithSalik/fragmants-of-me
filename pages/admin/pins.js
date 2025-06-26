// pages/admin/pins.js
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { unpinComment } from "@/lib/admin/unpinComment";
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";

export default function PinnedCommentsPage() {
  const [pins, setPins] = useState([]);

  const loadPins = async () => {
    const snap = await getDocs(collection(db, "pinnedComments"));
    setPins(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    loadPins();
  }, []);

  const handleUnpin = async (entryId, commentId) => {
    try {
      await unpinComment(entryId, commentId);
      toast.success("🧹 Unpinned");
      loadPins();
    } catch (err) {
      toast.error("❌ Failed to unpin");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📌 Pinned Comments</h1>

      <div className="space-y-6">
        {pins.length === 0 && <p className="text-gray-500">No pinned comments yet.</p>}
        {pins.map((pin) => (
          <div key={pin.id} className="border p-4 rounded bg-white shadow-sm">
            <p className="mb-2 text-sm text-gray-800 whitespace-pre-wrap">{pin.content}</p>
            <p className="text-xs text-gray-500 mb-2">
              By {pin.authorName} • Entry ID: {pin.entryId}
            </p>
            <button
              onClick={() => handleUnpin(pin.entryId, pin.commentId)}
              className="text-sm text-red-600 hover:underline"
            >
              Unpin
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
