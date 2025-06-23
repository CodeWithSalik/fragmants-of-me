import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-hot-toast";

const ADMIN_UID = "SIpfZSIJM5RKrvLahp7I4DLwiE93";

export default function CommentSection({ entryId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [user] = useAuthState(auth);

  useEffect(() => {
    const q = query(
      collection(db, "entries", entryId, "comments"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [entryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    await addDoc(collection(db, "entries", entryId, "comments"), {
      content: comment,
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      timestamp: serverTimestamp(),
    });
    setComment("");
    toast.success("💬 Comment posted!");
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    await deleteDoc(doc(db, "entries", entryId, "comments", commentId));
    toast.success("🗑️ Comment deleted");
  };

  const handleEdit = async (commentId) => {
    const ref = doc(db, "entries", entryId, "comments", commentId);
    await updateDoc(ref, {
      content: editText,
      timestamp: serverTimestamp(), // optional: update timestamp
    });
    toast.success("✏️ Comment updated");
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full p-2 border rounded"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            className="mt-2 bg-amber text-white px-4 py-1 rounded hover:bg-amber-dark"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-600">Login to comment.</p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="border-l-4 pl-4 border-amber bg-white p-3 rounded shadow-sm relative"
          >
            {editingId === c.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => handleEdit(c.id)}
                    className="text-green-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    className="text-gray-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-800 mb-1 whitespace-pre-wrap">{c.content}</p>
                <div className="text-xs text-gray-500">
                  {c.authorName} • {c.timestamp?.toDate().toLocaleString()}
                </div>

                {(user?.uid === c.authorId || user?.uid === ADMIN_UID) && (
                  <div className="text-xs text-right space-x-2 mt-1">
                    {user?.uid === c.authorId && (
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.content);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
