import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { unpinComment } from "@/lib/admin/unpinComment";
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";
import { FiMapPin, FiTrash2 } from "react-icons/fi";

export default function PinnedCommentsPage() {
  const [pins, setPins] = useState([]);

  const loadPins = async () => {
    const snap = await getDocs(collection(db, "pinnedComments"));
    setPins(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { loadPins(); }, []);

  const handleUnpin = async (entryId, commentId) => {
    try {
      await unpinComment(entryId, commentId);
      toast.success("Unpinned successfully");
      loadPins();
    } catch (err) {
      toast.error("Failed to unpin");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
          <FiMapPin className="text-accent text-2xl" />
          <h1 className="text-3xl font-serif font-bold text-ink">Pinned Comments</h1>
        </div>

        <div className="space-y-4">
          {pins.length === 0 && <p className="text-muted italic">No pins active.</p>}
          
          {pins.map((pin) => (
            <div key={pin.id} className="group relative bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 p-6 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-ink font-serif text-lg leading-relaxed mb-2">"{pin.content}"</p>
                  <p className="text-xs text-muted uppercase tracking-widest">
                    By <span className="font-bold text-accent">{pin.authorName}</span> • Entry ID: {pin.entryId.slice(0, 8)}...
                  </p>
                </div>
                
                <button
                  onClick={() => handleUnpin(pin.entryId, pin.commentId)}
                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-full"
                  title="Unpin Comment"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}