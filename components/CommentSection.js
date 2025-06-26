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
import { checkIfAdmin } from "@/lib/checkAdmin";


export default function CommentSection({ entryId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyBoxes, setReplyBoxes] = useState({});
  const [replies, setReplies] = useState({});
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    if (user?.uid) {
      checkIfAdmin(user.uid).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch Comments and Replies
  useEffect(() => {
    const unsubscribeReplies = {};
    const q = query(collection(db, "entries", entryId, "comments"), orderBy("timestamp", "desc"));

    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(loadedComments);

      loadedComments.forEach((comment) => {
        const replyRef = collection(db, "entries", entryId, "comments", comment.id, "replies");

        if (unsubscribeReplies[comment.id]) unsubscribeReplies[comment.id]();
        unsubscribeReplies[comment.id] = onSnapshot(
          query(replyRef, orderBy("timestamp", "asc")),
          (replySnap) => {
            setReplies((prev) => ({
              ...prev,
              [comment.id]: replySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
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

  // Add new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    await addDoc(collection(db, "entries", entryId, "comments"), {
      content: comment.trim(),
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      authorEmail: user.email || "", // Needed for email replies
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
      timestamp: serverTimestamp(),
    });
    toast.success("✏️ Comment updated");
    setEditingId(null);
    setEditText("");
  };

  // ✅ Only backend handles adding reply + email
  const handleReplySubmit = async (commentId, replyText) => {
    try {
      if (!replyText.trim() || !user) return;

      const originalComment = comments.find((c) => c.id === commentId);
      const isReplyToSelf = originalComment?.authorId === user.uid;

      if (isReplyToSelf) {
        const replyRef = collection(db, "entries", entryId, "comments", commentId, "replies");
        await addDoc(replyRef, {
          content: replyText.trim(),
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          timestamp: serverTimestamp(),
        });
        toast.success("↩️ Reply added");
      } else {
        const res = await fetch("https://newyear-backend.onrender.com/reply-to-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entryId,
            commentId,
            replyContent: replyText.trim(),
            replierName: user.displayName || "Anonymous",
            authorId: user.uid,
          }),
        });
        const data = await res.json();
        console.log("RESPONSE:", data);
        if (data.success) toast.success("↩️ Reply added & email sent");
        else toast.error("⚠️ Reply saved, email not sent");
      }

      setReplyBoxes((prev) => {
        const updated = { ...prev };
        delete updated[commentId]; // cleanly removes the box after success
        return updated;
      });
    } catch (err) {
      console.error("Reply error:", err);
      toast.error("⚠️ Failed to post reply");
    }
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

      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c.id} className="border-l-4 pl-4 border-amber bg-white p-3 rounded shadow-sm">
            {editingId === c.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="flex gap-2 text-sm">
                  <button onClick={() => handleEdit(c.id)} className="text-green-600 hover:underline">
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

                <div className="text-xs space-x-3 mt-1">
                  <button
                    onClick={() =>
                      setReplyBoxes((prev) => ({
                        ...prev,
                        [c.id]: prev[c.id] ? "" : "",
                      }))
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Reply
                  </button>
                  {(user?.uid === c.authorId || isAdmin) && (
                    <>
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
                    </>
                  )}
                </div>

                {/* Replies */}
                {replies[c.id]?.length > 0 && (
                  <div className="mt-2 border-l-2 pl-3 border-gray-200 space-y-2">
                    {replies[c.id].map((r) => (
                      <div key={r.id} className="bg-gray-50 p-2 rounded text-sm">
                        <p>{r.content}</p>
                        <div className="text-xs text-gray-500">
                          {r.authorName} • {r.timestamp?.toDate().toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply box */}
                {replyBoxes[c.id] !== undefined && (
                  <div className="mt-2">
                    <textarea
                      className="w-full p-2 border rounded text-sm"
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
        ))}
      </div>
    </div>
  );
}
