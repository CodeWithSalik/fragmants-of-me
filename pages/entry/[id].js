import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getDoc, doc, deleteDoc, updateDoc, collection, getDocs, setDoc, getCountFromServer, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import CommentSection from "@/components/CommentSection";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";
import MotionWrap from "@/components/MotionWrap";
import ReactionLine from "@/components/ReactionLine";
import Head from "next/head";
import { FiHeart, FiBookmark, FiEye, FiEdit2, FiTrash2, FiGlobe, FiLock } from "react-icons/fi";

export default function EntryPage({ setAmbientMood }) {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState(null);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // 1. Admin Check
  useEffect(() => {
    if (user?.uid) checkIfAdmin(user.uid).then(setIsAdmin);
    else setIsAdmin(false);
  }, [user]);

  // 2. Fetch Entry & Set Mood
  useEffect(() => {
    if (!id) return;
    const loadEntry = async () => {
      const ref = doc(db, "entries", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEntry({ id: snap.id, ...data });
        // Trigger ambient sound change based on entry mood
        if (setAmbientMood) setAmbientMood(data.mood || "warm");
      }
    };
    loadEntry();
  }, [id, setAmbientMood]);

  // 3. Fetch Stats (Likes, Views, Saved Status)
  useEffect(() => {
    if (!entry) return;
    const loadStats = async () => {
      // Likes
      const likesRef = collection(db, "entries", entry.id, "likes");
      const likesSnap = await getDocs(likesRef);
      setLikesCount(likesSnap.size);
      if (user) setHasLiked(likesSnap.docs.some(d => d.id === user.uid));

      // Views
      const viewsRef = collection(db, "entries", entry.id, "views");
      const viewsSnap = await getCountFromServer(viewsRef);
      setViewsCount(viewsSnap.data().count);

      // Saved Check
      if (user) {
        const savedRef = doc(db, "users", user.uid, "saved", entry.id);
        const savedSnap = await getDoc(savedRef);
        setIsSaved(savedSnap.exists());
      }
    };
    loadStats();
  }, [entry, user]);

  // 4. Record View
  useEffect(() => {
    if (!entry || !user) return;
    const viewRef = doc(db, "entries", entry.id, "views", user.uid);
    setDoc(viewRef, { timestamp: serverTimestamp() }, { merge: true });
  }, [entry, user]);

  // --- ACTIONS ---

  const toggleLike = async () => {
    if (!user) return toast.error("Please login to like");
    const likeRef = doc(db, "entries", entry.id, "likes", user.uid);
    if (hasLiked) {
      await deleteDoc(likeRef);
      setHasLiked(false);
      setLikesCount(p => p - 1);
    } else {
      await setDoc(likeRef, { createdAt: new Date(), uid: user.uid, name: user.displayName });
      setHasLiked(true);
      setLikesCount(p => p + 1);
    }
  };

  const toggleSave = async () => {
    if (!user) return toast.error("Please login to save");
    const ref = doc(db, "users", user.uid, "saved", entry.id);
    if (isSaved) {
      await deleteDoc(ref);
      setIsSaved(false);
      toast.success("Removed from saved");
    } else {
      await setDoc(ref, { savedAt: serverTimestamp() });
      setIsSaved(true);
      toast.success("Saved to collection");
    }
  };

  const handleDelete = async () => {
    if (confirm("Permanently delete this fragment?")) {
      await deleteDoc(doc(db, "entries", id));
      toast.success("Deleted");
      router.push("/");
    }
  };

  const togglePrivacy = async () => {
    await updateDoc(doc(db, "entries", id), { isPrivate: !entry.isPrivate });
    setEntry({ ...entry, isPrivate: !entry.isPrivate });
    toast.success(entry.isPrivate ? "Now Public" : "Now Private");
  };

  if (!entry) return <div className="min-h-screen flex items-center justify-center text-muted">Loading fragment...</div>;

  const isAuthor = user && entry.uid === user.uid;
  
  // --- SEO PREPARATION ---
  const description = entry.content.slice(0, 150).replace(/\n/g, " ") + (entry.content.length > 150 ? "..." : "");
  // Note: Update this URL when you have your real domain
  const shareUrl = `https://fragments-of-me.vercel.app/entry/${entry.id}`; 

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      
      {/* --- DYNAMIC SEO HEAD --- */}
      <Head>
        <title>{entry.title} | Fragments of Me</title>
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={entry.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="Fragments of Me" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={entry.title} />
        <meta name="twitter:description" content={description} />
      </Head>

      <div className="aura-card reading-mode">
        <div className="aura-card-content p-8 md:p-12">
          
          <MotionWrap>
            {/* Header Metadata */}
            <div className="flex justify-between items-start mb-8 border-b border-black/5 dark:border-white/5 pb-6">
              <div>
                <h1 className="hero-title text-3xl md:text-4xl text-ink mb-3 leading-tight">
                  {entry.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted font-medium">
                  <span>By {entry.authorName}</span>
                  <span>•</span>
                  <span>{entry.timestamp?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-ink/5 text-ink/70">
                  {entry.type}
                </span>
                {entry.mood && (
                  <span className="text-xs text-muted/60 italic capitalize">
                    {entry.mood} mood
                  </span>
                )}
              </div>
            </div>

            {/* CONTENT (Interactive Lines) */}
            <div className="prose prose-lg prose-p:text-ink/90 prose-p:font-serif prose-p:leading-loose max-w-none mb-12">
              {entry.content.split("\n").map((line, i) => (
                <ReactionLine key={i} entryId={entry.id} lineIndex={i} text={line} />
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-6">
                
                <button 
                  onClick={toggleLike} 
                  className={`flex items-center gap-2 transition-colors ${hasLiked ? "text-red-500" : "text-muted hover:text-red-500"}`}
                >
                  <FiHeart className={hasLiked ? "fill-current" : ""} size={20} />
                  <span className="text-sm font-semibold">{likesCount}</span>
                </button>

                <button 
                  onClick={toggleSave} 
                  className={`flex items-center gap-2 transition-colors ${isSaved ? "text-accent" : "text-muted hover:text-accent"}`}
                >
                  <FiBookmark className={isSaved ? "fill-current" : ""} size={20} />
                  <span className="text-sm font-semibold">{isSaved ? "Saved" : "Save"}</span>
                </button>

                <div className="flex items-center gap-2 text-muted cursor-default" title="Total Views">
                  <FiEye size={20} />
                  <span className="text-sm font-semibold">{viewsCount}</span>
                </div>

              </div>
              
              <a href="https://coff.ee/codewithsalik" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent-strong transition-colors">
                ☕ Support Author
              </a>
            </div>
          </MotionWrap>

        </div>
      </div>

      {/* Admin & Author Controls */}
      {(isAdmin || isAuthor) && (
        <div className="mt-6 flex justify-end gap-3 opacity-70 hover:opacity-100 transition-opacity">
          <button onClick={() => router.push(`/edit/${entry.id}`)} className="text-sm text-blue-500 hover:underline flex items-center gap-2">
            <FiEdit2 /> Edit
          </button>
          <button onClick={togglePrivacy} className="text-sm text-amber-500 hover:underline flex items-center gap-2">
            {entry.isPrivate ? <FiLock /> : <FiGlobe />} {entry.isPrivate ? "Make Public" : "Make Private"}
          </button>
          <button onClick={handleDelete} className="text-sm text-red-500 hover:underline flex items-center gap-2">
            <FiTrash2 /> Delete
          </button>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection entryId={entry.id} />
      </div>
    </div>
  );
}