import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import FragmentCard from "@/components/FragmentCard";
import Head from "next/head";

export async function getServerSideProps({ params }) {
  const authorSnap = await getDoc(doc(db, "authors", params.id));
  
  if (!authorSnap.exists()) {
    return { notFound: true };
  }

  // --- FIX: GENERIC SERIALIZER ---
  // This helper function converts ANY Firestore Timestamp to a string
  const serializeData = (data) => {
    const serialized = { ...data };
    Object.keys(serialized).forEach((key) => {
      // Check if the value is a Firestore Timestamp (has toDate method)
      if (serialized[key] && typeof serialized[key].toDate === 'function') {
        serialized[key] = serialized[key].toDate().toISOString();
      }
    });
    return serialized;
  };

  // Serialize the author data safely
  const authorData = serializeData(authorSnap.data());
  const serializableAuthor = { ...authorData, id: params.id };

  // Fetch Posts & Serialize them too
  const postsQ = query(
    collection(db, "entries"),
    where("uid", "==", params.id),
    where("isPrivate", "==", false)
  );
  const postsSnap = await getDocs(postsQ);
  
  const posts = postsSnap.docs.map(d => ({
    id: d.id,
    ...serializeData(d.data()) // Apply the same fix to posts
  }));

  return {
    props: {
      author: serializableAuthor,
      posts: posts
    }
  };
}

export default function AuthorProfile({ author, posts }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!user || !author.id) return;
    const checkFollow = async () => {
      const ref = doc(db, "users", user.uid, "following", author.id);
      const snap = await getDoc(ref);
      setFollowing(snap.exists());
    };
    checkFollow();
  }, [user, author.id]);

  const toggleFollow = async () => {
    if (!user) return router.push("/login");
    const userFollowRef = doc(db, "users", user.uid, "following", author.id);
    const authorFollowerRef = doc(db, "authors", author.id, "followers", user.uid);

    if (following) {
      await deleteDoc(userFollowRef);
      await deleteDoc(authorFollowerRef);
      setFollowing(false);
    } else {
      await setDoc(userFollowRef, { followedAt: serverTimestamp() });
      await setDoc(authorFollowerRef, { followedAt: serverTimestamp() });
      setFollowing(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <Head><title>{author.name} | Fragments of Me</title></Head>

      {/* 1. Author Aura Card */}
      <div className="aura-card reading-mode max-w-3xl mx-auto mb-20">
        <div className="aura-card-content p-10 text-center">
          
          <div className="w-24 h-24 mx-auto bg-accent/10 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner text-accent font-serif">
            {author.name.charAt(0)}
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-ink mb-3">{author.name}</h1>
          
          <p className="text-muted font-serif italic max-w-lg mx-auto leading-relaxed">
            {author.bio || "A quiet observer of life."}
          </p>

          <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted/60">
            Joined {new Date(author.joinedAt).toLocaleDateString()}
          </div>

          {user && user.uid !== author.id && (
            <button 
              onClick={toggleFollow} 
              className={`mt-8 px-8 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-all ${
                following 
                  ? "bg-transparent border border-muted text-muted hover:border-red-500 hover:text-red-500" 
                  : "btn-primary shadow-lg hover:shadow-accent/20"
              }`}
            >
              {following ? "Unfollow" : "Follow Author"}
            </button>
          )}
        </div>
      </div>

      {/* 2. Masonry Feed */}
      <div className="flex items-center gap-4 mb-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif font-bold text-ink">Published Works</h2>
        <div className="h-[1px] flex-grow bg-black/10 dark:bg-white/10"></div>
        <span className="text-sm font-bold text-muted">{posts.length} entries</span>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted py-10">This author has not published yet.</p>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {posts.map((entry, idx) => (
            <div key={entry.id} className="break-inside-avoid mb-8">
              <FragmentCard 
                // Re-hydrate the date object for the card component
                entry={{...entry, timestamp: new Date(entry.timestamp)}} 
                index={idx} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}