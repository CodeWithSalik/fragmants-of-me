import { useEffect, useState } from "react";
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc, getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";
import { FiTrash2, FiCornerDownRight, FiMapPin } from "react-icons/fi";

export default function CommentSection({ entryId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [replyBoxes, setReplyBoxes] = useState({});
  const [replies, setReplies] = useState({});
  const [pinnedId, setPinnedId] = useState(null);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.uid) checkIfAdmin(user.uid).then(setIsAdmin);
  }, [user]);

  useEffect(() => {
    getDoc(doc(db, "entries", entryId)).then((snap) => {
      if (snap.exists()) setPinnedId(snap.data().pinnedCommentId || null);
    });
  }, [entryId]);

  useEffect(() => {
    const q = query(collection(db, "entries", entryId, "comments"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(loaded);
      
      loaded.forEach((c) => {
        const rRef = collection(db, "entries", entryId, "comments", c.id, "replies");
        onSnapshot(query(rRef, orderBy("timestamp", "asc")), (rSnap) => {
          setReplies((prev) => ({ ...prev, [c.id]: rSnap.docs.map(d => ({ id: d.id, ...d.data() })) }));
        });
      });
    });
    return () => unsubscribe();
  }, [entryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    await addDoc(collection(db, "entries", entryId, "comments"), {
      content: comment.trim(),
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      timestamp: serverTimestamp(),
    });
    setComment("");
    toast.success("Echo left.");
  };

  const handleReplySubmit = async (commentId, text) => {
    if (!text.trim() || !user) return;
    await addDoc(collection(db, "entries", entryId, "comments", commentId, "replies"), {
      content: text.trim(),
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      timestamp: serverTimestamp(),
    });
    setReplyBoxes(prev => ({ ...prev, [commentId]: "" }));
    toast.success("Replied.");
  };

  const handleDelete = async (path) => {
    if (confirm("Delete?")) await deleteDoc(doc(db, ...path));
  };

  const pinComment = async (id) => {
    await updateDoc(doc(db, "entries", entryId), { pinnedCommentId: id });
    setPinnedId(id);
  };

  const renderComment = (c, isReply = false, parentId = null) => {
    const isPinned = c.id === pinnedId && !isReply;
    const isOwner = user?.uid === c.authorId || isAdmin;

    return (
      <div 
        key={c.id} 
        className={`relative group transition-all duration-300 mb-4 
          ${isReply ? "ml-8 mt-2 pl-4 border-l-2 border-accent/20" : "p-5 rounded-xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10"}
          ${isPinned ? "ring-2 ring-accent/50 bg-accent/5" : ""}
        `}
      >
        {isPinned && <div className="absolute -top-3 -right-2 bg-accent text-white text-[10px] px-2 py-1 rounded-full shadow-sm flex items-center gap-1"><FiMapPin /> PINNED</div>}

        <div className="flex justify-between items-start mb-2">
          <div className="text-xs font-bold uppercase tracking-widest text-muted/80">
            {c.authorName}
          </div>
          <div className="text-[10px] text-muted/50">
            {c.timestamp?.toDate().toLocaleDateString()}
          </div>
        </div>

        <p className="text-ink font-serif text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>

        <div className="flex gap-4 mt-3 text-xs font-bold text-muted/60 opacity-60 group-hover:opacity-100 transition-opacity">
          {!isReply && user && (
            <button onClick={() => setReplyBoxes(p => ({ ...p, [c.id]: !p[c.id] }))} className="hover:text-accent transition-colors flex items-center gap-1">
              <FiCornerDownRight /> Reply
            </button>
          )}
          {isOwner && (
            <button onClick={() => handleDelete(isReply ? ["entries", entryId, "comments", parentId, "replies", c.id] : ["entries", entryId, "comments", c.id])} className="hover:text-red-500 transition-colors flex items-center gap-1">
              <FiTrash2 /> Delete
            </button>
          )}
          {isAdmin && !isReply && (
            <button onClick={() => pinComment(isPinned ? null : c.id)} className="hover:text-accent transition-colors flex items-center gap-1">
              <FiMapPin /> {isPinned ? "Unpin" : "Pin"}
            </button>
          )}
        </div>

        {!isReply && replyBoxes[c.id] && (
          <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
            <input
              className="text-sm w-full p-2 bg-white/50 dark:bg-black/20 rounded border border-black/5"
              placeholder="Whisper back..."
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(c.id, e.target.value)}
            />
          </div>
        )}

        {!isReply && replies[c.id]?.map(r => renderComment(r, true, c.id))}
      </div>
    );
  };

  return (
    <div className="mt-16 pt-10 border-t border-black/5 dark:border-white/5">
      <h3 className="text-xl font-serif font-bold text-ink mb-6">Echoes</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 relative">
          <textarea
            className="w-full h-24 p-4 pr-12 resize-none text-base font-serif bg-white/40 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none transition-all"
            placeholder="Leave a fragment of your thought..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute bottom-3 right-3 p-2 bg-accent/10 text-accent rounded-full hover:bg-accent hover:text-white transition-all disabled:opacity-50"
            disabled={!comment.trim()}
          >
            <FiCornerDownRight size={18} />
          </button>
        </form>
      ) : (
        <p className="text-center text-muted italic mb-10">Login to leave an echo.</p>
      )}

      <div className="space-y-2">
        {pinnedId && comments.find(c => c.id === pinnedId) && renderComment(comments.find(c => c.id === pinnedId))}
        {comments.filter(c => c.id !== pinnedId).map(c => renderComment(c))}
        {comments.length === 0 && <p className="text-center text-muted/40 italic">Silence...</p>}
      </div>
    </div>
  );
}