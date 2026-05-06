import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getDoc, doc, deleteDoc, updateDoc, collection, setDoc, getCountFromServer, serverTimestamp, increment
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import CommentSection from "@/components/CommentSection";
import toast from "react-hot-toast";
import { checkIfAdmin } from "@/lib/checkAdmin";
import MotionWrap from "@/components/MotionWrap";
import ReactionLine from "@/components/ReactionLine";
import SeoHead from "@/components/SeoHead";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { FiHeart, FiBookmark, FiEye, FiEdit2, FiTrash2, FiGlobe, FiLock, FiMessageSquare } from "react-icons/fi";

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
        if (setAmbientMood) setAmbientMood(data.mood || "warm");
      }
    };
    loadEntry();
  }, [id, setAmbientMood]);

  // 3. Fetch Stats (OPTIMIZED)
  useEffect(() => {
    if (!entry) return;
    const loadStats = async () => {
      const likesRef = collection(db, "entries", entry.id, "likes");
      const likesCountSnap = await getCountFromServer(likesRef);
      setLikesCount(likesCountSnap.data().count);

      if (user) {
        const userLikeRef = doc(db, "entries", entry.id, "likes", user.uid);
        const userLikeSnap = await getDoc(userLikeRef);
        setHasLiked(userLikeSnap.exists());
      }

      const viewsRef = collection(db, "entries", entry.id, "views");
      const viewsSnap = await getCountFromServer(viewsRef);
      setViewsCount(viewsSnap.data().count);

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
    const recordView = async () => {
      const viewRef = doc(db, "entries", entry.id, "views", user.uid);
      const entryRef = doc(db, "entries", entry.id);

      const viewSnap = await getDoc(viewRef);
      if (!viewSnap.exists()) {
        await setDoc(viewRef, { timestamp: serverTimestamp() });
        await updateDoc(entryRef, { views: increment(1) });
        setViewsCount(prev => prev + 1);
      }
    };
    recordView();
  }, [entry, user]);

  // --- ACTIONS ---

  const toggleLike = async () => {
    if (!user) return toast.error("Please login to like");
    
    const likeRef = doc(db, "entries", entry.id, "likes", user.uid);
    const entryRef = doc(db, "entries", entry.id);

    setHasLiked(!hasLiked);
    setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);

    if (hasLiked) {
      await deleteDoc(likeRef);
      await updateDoc(entryRef, { likes: increment(-1) });
    } else {
      await setDoc(likeRef, { createdAt: new Date(), uid: user.uid, name: user.displayName });
      await updateDoc(entryRef, { likes: increment(1) });
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
  const description = entry.content.slice(0, 150).replace(/\n/g, " ") + (entry.content.length > 150 ? "..." : "");
  const shareUrl = absoluteUrl(`/entry/${entry.id}`);
  const publishedAt = entry.timestamp?.toDate?.()?.toISOString?.() || null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <SeoHead
        title={entry.title}
        description={description}
        path={`/entry/${entry.id}`}
        type="article"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: entry.title,
            description,
            author: {
              '@type': 'Person',
              name: entry.authorName || 'Unknown',
            },
            datePublished: publishedAt,
            dateModified: publishedAt,
            mainEntityOfPage: shareUrl,
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: absoluteUrl('/'),
            },
          }),
        }}
      />

      <div className="aura-card reading-mode">
        <div className="aura-card-content p-8 md:p-12">
          
          <MotionWrap>
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
                  {entry.type === 'perspective' ? 'Perspectives' : entry.type}
                </span>
                {entry.mood && (
                  <span className="text-xs text-muted/60 italic capitalize">
                    {entry.mood} mood
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-lg prose-p:text-ink/90 prose-p:font-serif prose-p:leading-loose max-w-none mb-12">
              {entry.content.split("\n").map((line, i) => (
                <ReactionLine key={i} entryId={entry.id} lineIndex={i} text={line} />
              ))}
            </div>

            {/* --- FIX: Added flex-wrap and adjusted gap for mobile responsiveness --- */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-black/5 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                
                <button 
                  onClick={toggleLike} 
                  className={`flex items-center gap-2 transition-colors ${hasLiked ? "text-red-500" : "text-muted hover:text-red-500"}`}
                >
                  <FiHeart className={hasLiked ? "fill-current" : ""} size={20} />
                  <span className="text-sm font-semibold">{likesCount}</span>
                </button>

                <button 
                  onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 transition-colors text-muted hover:text-ink"
                >
                  <FiMessageSquare size={20} />
                  <span className="text-sm font-semibold">Discuss</span>
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

      <div className="mt-12">
        <CommentSection entryId={entry.id} />
      </div>
    </div>
  );
}