import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import CommentSection from "@/components/CommentSection";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";

export default function EntryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState(null);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      checkIfAdmin(user.uid).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;
    const loadEntry = async () => {
      const ref = doc(db, "entries", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setEntry({ id: snap.id, ...snap.data() });
    };
    loadEntry();
  }, [id]);

  useEffect(() => {
    if (!entry || !user) return;

    const fetchLikes = async () => {
      const likesRef = collection(db, "entries", entry.id, "likes");
      const likesSnap = await getDocs(likesRef);
      setLikesCount(likesSnap.size);
      setHasLiked(likesSnap.docs.some(doc => doc.id === user.uid));
    };

    fetchLikes();
  }, [entry, user]);

  const handleDelete = async () => {
    if (confirm("Delete this entry?")) {
      await deleteDoc(doc(db, "entries", id));
      toast.error("Entry Deleted!");
      router.push("/");
    }
  };

  const togglePrivacy = async () => {
    const ref = doc(db, "entries", id);
    await updateDoc(ref, {
      isPrivate: !entry.isPrivate,
    });
    alert("Updated visibility");
    setEntry({ ...entry, isPrivate: !entry.isPrivate });
  };

  const toggleLike = async () => {
    if (!user || !entry) return;

    const likeRef = doc(db, "entries", entry.id, "likes", user.uid);

    if (hasLiked) {
      await deleteDoc(likeRef);
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await setDoc(likeRef, {
        createdAt: new Date(),
        name: user.displayName || "Anonymous",
        email: user.email || "",
        uid: user.uid,
      });
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  if (!entry) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-amber-dark mb-1">{entry.title}</h1>
      <p className="text-sm text-gray-600">✍️ by {entry.authorName}</p>

      <p className="text-sm text-gray-500 mb-6">
        {entry.timestamp?.toDate().toLocaleDateString()} — {entry.type}
      </p>

      <div className="prose prose-amber mb-6 whitespace-pre-wrap">
        {entry.content}
      </div>

      {user && (
        <div className="flex items-center gap-2 mt-6">
          <button onClick={toggleLike} className="text-2xl">
            {hasLiked ? "❤️" : "🤍"}
          </button>
          <span className="text-sm text-gray-700">
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </span>
        </div>
      )}

      <CommentSection entryId={entry.id} />

      {isAdmin && (
        <div className="flex gap-4 mt-6 text-sm">
          <button
            onClick={() => router.push(`/edit/${entry.id}`)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
          <button
            onClick={togglePrivacy}
            className="text-amber-600 hover:underline"
          >
            Make {entry.isPrivate ? "Public" : "Private"}
          </button>
        </div>
      )}
    </div>
  );
}
