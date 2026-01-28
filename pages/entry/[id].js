import AmbientPlayer from "@/components/AmbientPlayer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { moodThemes } from "@/lib/moodThemes";
import {
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
  getCountFromServer,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import CommentSection from "@/components/CommentSection";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";
import MotionWrap from "@/components/MotionWrap";
import ReactionLine from "@/components/ReactionLine";




export default function EntryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState(null);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewsCount, setViewsCount] = useState(0); // 👁️ NEW

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

  // 👁️ Record a view (one per user)
  useEffect(() => {
    const trackView = async () => {
      if (!entry || !user) return;

      const viewRef = doc(db, "entries", entry.id, "views", user.uid);
      await setDoc(viewRef, { timestamp: serverTimestamp() }, { merge: true });
    };
    trackView();
  }, [entry, user]);

  // 👁️ Fetch views count
  useEffect(() => {
    const fetchViews = async () => {
      if (!entry) return;

      const viewsRef = collection(db, "entries", entry.id, "views");
      const snapshot = await getCountFromServer(viewsRef);
      setViewsCount(snapshot.data().count);
    };
    fetchViews();
  }, [entry]);

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
    <>
      <AmbientPlayer mood={entry.mood} />
      <div className={`${moodThemes[entry.mood] || moodThemes.warm} min-h-screen px-6 py-10`}>
        <div className="max-w-3xl mx-auto">

          <MotionWrap>
            <h1 className="title text-4xl md:text-5xl font-semibold tracking-tight mb-2">


              {entry.title}
            </h1>
          </MotionWrap>

          <p className="small-text">✍️ by {entry.authorName}</p>

          <p className="small-text
">
            {entry.timestamp?.toDate().toLocaleDateString()} — {entry.type}
          </p>

          <MotionWrap delay={0.15}>
            <div className="prose prose-amber mb-6 whitespace-pre-wrap glass p-6">

              {entry.content.split("\n").map((line, i) => (
                <ReactionLine
                  key={i}
                  entryId={entry.id}
                  lineIndex={i}
                  text={line}
                />
              ))}

            </div>
          </MotionWrap>


          {user && (
            <div className="flex items-center gap-4 mt-6">
              <button onClick={toggleLike} className="text-2xl">
                {hasLiked ? "❤️" : "🤍"}
              </button>
              <span className="text-sm text-gray-700">
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </span>

              <span className="text-sm text-gray-700">
                👁 {viewsCount} {viewsCount === 1 ? "view" : "views"}
              </span>
              <div className="mb-8 text-center">
                <a
                  href="https://coff.ee/codewithsalik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 text-sm font-medium bg-accent text-white rounded-full shadow hover:bg-amber-700 transition"
                >
                  ☕ Buy me a coffee / Support my work
                </a>
              </div>
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
                className="text-accent hover:underline"
              >
                Make {entry.isPrivate ? "Public" : "Private"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
