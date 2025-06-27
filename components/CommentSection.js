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
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";

export default function CommentSection({ entryId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyBoxes, setReplyBoxes] = useState({});
  const [replies, setReplies] = useState({});
  const [pinnedId, setPinnedId] = useState(null);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.uid) checkIfAdmin(user.uid).then(setIsAdmin);
  }, [user]);

  useEffect(() => {
    const ref = doc(db, "entries", entryId);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setPinnedId(snap.data().pinnedCommentId || null);
      }
    });
  }, [entryId]);

  useEffect(() => {
    const unsubscribeReplies = {};
    const q = query(collection(db, "entries", entryId, "comments"), orderBy("timestamp", "desc"));

    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(loaded);

      loaded.forEach((c) => {
        const rRef = collection(db, "entries", entryId, "comments", c.id, "replies");
        if (unsubscribeReplies[c.id]) unsubscribeReplies[c.id]();
        unsubscribeReplies[c.id] = onSnapshot(
          query(rRef, orderBy("timestamp", "asc")),
          (rSnap) => {
            setReplies((prev) => ({
              ...prev,
              [c.id]: rSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            }));
          }
        );
      });
    });

    return () => {
      unsubscribeComments();
      Object.values(unsubscribeReplies).forEach((unsub) => unsub && unsub());
    };
  }, [entryId]);

  const handleReplySubmit = async (commentId, text) => {
    if (!text.trim() || !user) return;

    try {
      const res = await fetch("https://newyear-backend.onrender.com/reply-to-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId,
          commentId,
          replyContent: text,
          replierName: user.displayName || "Anonymous",
          authorId: user.uid,
        }),
      });

      const json = await res.json();
      console.log("📬 Reply backend response:", json);
      if (!json.success) throw new Error(json.message);

      toast.success("↩️ Replied successfully!");
      setReplyBoxes((prev) => {
        const updated = { ...prev };
        delete updated[commentId];
        return updated;
      });
    } catch (err) {
      console.error("❌ Reply failed:", err);
      toast.error("❌ Failed to reply");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    await addDoc(collection(db, "entries", entryId, "comments"), {
      content: comment.trim(),
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      authorEmail: user.email || "", // 🔒 Must not be empty
      timestamp: serverTimestamp(),
    });
    setComment("");
    toast.success("💬 Comment posted!");
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    await deleteDoc(doc(db, "entries", entryId, "comments", commentId));
    toast.success("🗑️ Deleted");
  };

  const handleEdit = async (id) => {
    await updateDoc(doc(db, "entries", entryId, "comments", id), {
      content: editText,
      timestamp: serverTimestamp(),
    });
    setEditingId(null);
    setEditText("");
    toast.success("✏️ Edited");
  };

  const pinComment = async (commentId) => {
    await updateDoc(doc(db, "entries", entryId), { pinnedCommentId: commentId });
    setPinnedId(commentId);
    toast.success("📌 Comment pinned");
  };

  const unpinComment = async () => {
    await updateDoc(doc(db, "entries", entryId), { pinnedCommentId: null });
    setPinnedId(null);
    toast.success("📍 Unpinned");
  };

  const renderComment = (c, isPinned = false) => (
    <div
      key={c.id}
      className={`border-l-4 pl-4 rounded shadow-sm transition-all duration-300 
        ${isPinned ? "border-green-600" : "border-amber"} 
        bg-white dark:bg-[#2c261f] text-ink dark:text-[#fefae0]`}
    >
      {editingId === c.id ? (
        <>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border rounded mb-2 bg-white dark:bg-[#2c261f] text-gray-800 dark:text-[#fefae0] border-gray-300 dark:border-[#4d3f2d]"
          />
          <div className="flex gap-2 text-sm">
            <button onClick={() => handleEdit(c.id)} className="text-green-600 hover:underline">
              Save
            </button>
            <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm mb-1 whitespace-pre-wrap">
            {c.content}
          </p>
          <div className="text-xs text-gray-500 dark:text-[#b9b4a7]">
            {c.authorName} • {c.timestamp?.toDate().toLocaleString()}
          </div>

          <div className="text-xs space-x-3 mt-1 text-gray-600 dark:text-[#d4cfc7]">
            <button
              onClick={() => setReplyBoxes((prev) => ({ ...prev, [c.id]: prev[c.id] ? "" : "" }))}
              className="text-blue-600 hover:underline"
            >
              Reply
            </button>
            {(user?.uid === c.authorId || isAdmin) && (
              <>
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditText(c.content);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </>
            )}
            {isAdmin && (
              pinnedId === c.id ? (
                <button onClick={unpinComment} className="text-green-700 hover:underline">Unpin</button>
              ) : (
                <button onClick={() => pinComment(c.id)} className="text-yellow-700 hover:underline">Pin</button>
              )
            )}
          </div>

          {replies[c.id]?.length > 0 && (
            <div className="mt-2 border-l-2 pl-3 border-gray-200 dark:border-[#4d3f2d] space-y-2">
              {replies[c.id].map((r) => (
                <div
                  key={r.id}
                  className={`p-2 rounded text-sm 
                    ${r.authorId === user?.uid && isAdmin
                      ? "bg-yellow-100 dark:bg-[#3a2f22]"
                      : "bg-gray-50 dark:bg-[#1e1b16]"
                    } text-gray-800 dark:text-[#fefae0]`}
                >
                  <p>{r.content}</p>
                  <div className="text-xs text-gray-500 dark:text-[#b9b4a7]">
                    {r.authorName} • {r.timestamp?.toDate().toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {replyBoxes[c.id] !== undefined && (
            <div className="mt-2">
              <textarea
                className="w-full p-2 border rounded text-sm bg-white dark:bg-[#2c261f] text-gray-800 dark:text-[#fefae0] border-gray-300 dark:border-[#4d3f2d]"
                rows="2"
                value={replyBoxes[c.id]}
                onChange={(e) =>
                  setReplyBoxes((prev) => ({ ...prev, [c.id]: e.target.value }))
                }
                placeholder="Write a reply..."
              />
              <button
                onClick={() => handleReplySubmit(c.id, replyBoxes[c.id])}
                className="mt-1 px-3 py-1 bg-amber text-white text-sm rounded hover:bg-amber-dark"
              >
                Post Reply
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full p-2 border rounded bg-white dark:bg-[#2c261f] text-gray-800 dark:text-[#fefae0] border-gray-300 dark:border-[#4d3f2d]"
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
        <p className="text-sm text-gray-600 dark:text-[#b9b4a7]">Login to comment.</p>
      )}

      <div className="space-y-6">
        {pinnedId && comments.filter((c) => c.id === pinnedId).map((c) => renderComment(c, true))}
        {comments.filter((c) => c.id !== pinnedId).map((c) => renderComment(c, false))}
      </div>
    </div>
  );
}
