import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { 
  doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, 
  serverTimestamp, getCountFromServer, addDoc 
} from "firebase/firestore";
import FragmentCard from "@/components/FragmentCard";
import Head from "next/head";
import { FiUsers, FiUserPlus, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";

export async function getServerSideProps({ params }) {
  const authorSnap = await getDoc(doc(db, "authors", params.id));
  
  if (!authorSnap.exists()) {
    return { notFound: true };
  }

  const serializeData = (data) => {
    const serialized = { ...data };
    Object.keys(serialized).forEach((key) => {
      if (serialized[key] && typeof serialized[key].toDate === 'function') {
        serialized[key] = serialized[key].toDate().toISOString();
      }
    });
    return serialized;
  };

  const authorData = serializeData(authorSnap.data());
  const serializableAuthor = { ...authorData, id: params.id };

  const postsQ = query(
    collection(db, "entries"),
    where("uid", "==", params.id),
    where("isPrivate", "==", false)
  );
  const postsSnap = await getDocs(postsQ);
  
  const posts = postsSnap.docs.map(d => ({
    id: d.id,
    ...serializeData(d.data())
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
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!author.id) return;

    // 1. Fetch Follower Count
    const fetchFollowerCount = async () => {
      try {
        const followersRef = collection(db, "authors", author.id, "followers");
        const snapshot = await getCountFromServer(followersRef);
        setFollowerCount(snapshot.data().count);
      } catch (err) {
        console.error("Error fetching followers:", err);
      }
    };
    fetchFollowerCount();

    // 2. Check if Current User Follows
    if (user) {
      const checkFollow = async () => {
        const ref = doc(db, "users", user.uid, "following", author.id);
        const snap = await getDoc(ref);
        setFollowing(snap.exists());
      };
      checkFollow();
    }
  }, [user, author.id]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow authors");
      return router.push("/login");
    }
    
    // Optimistic UI Update
    const isNowFollowing = !following;
    setFollowing(isNowFollowing);
    setFollowerCount(prev => isNowFollowing ? prev + 1 : prev - 1);

    const userFollowRef = doc(db, "users", user.uid, "following", author.id);
    const authorFollowerRef = doc(db, "authors", author.id, "followers", user.uid);

    try {
      if (!isNowFollowing) {
        // --- UNFOLLOW ---
        await deleteDoc(userFollowRef);
        await deleteDoc(authorFollowerRef);
        toast.success("Unfollowed");
      } else {
        // --- FOLLOW ---
        await setDoc(userFollowRef, { followedAt: serverTimestamp() });
        await setDoc(authorFollowerRef, { followedAt: serverTimestamp() });
        toast.success("Following");

        // --- TRIGGER NOTIFICATION ---
        // Only notify if not following self
        if (user.uid !== author.id) {
          await addDoc(collection(db, "users", author.id, "notifications"), {
            type: "new_follower",
            followerName: user.displayName || "A Reader",
            followerId: user.uid,
            createdAt: serverTimestamp(),
            read: false
          });
        }
      }
    } catch (error) {
      console.error("Follow action failed:", error);
      // Revert UI on error
      setFollowing(!isNowFollowing);
      setFollowerCount(prev => !isNowFollowing ? prev + 1 : prev - 1);
      toast.error("Action failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <Head><title>{author.name} | Fragments of Me</title></Head>

      {/* Author Aura Card */}
      <div className="aura-card reading-mode max-w-3xl mx-auto mb-20">
        <div className="aura-card-content p-10 text-center">
          
          <div className="w-24 h-24 mx-auto bg-accent/10 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner text-accent font-serif">
            {author.name.charAt(0)}
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-ink mb-3">{author.name}</h1>
          
          <p className="text-muted font-serif italic max-w-lg mx-auto leading-relaxed">
            {author.bio || "A quiet observer of life."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
             <div className="flex flex-col items-center">
               <span className="font-bold text-ink text-lg">{posts.length}</span>
               <span className="text-[10px] uppercase tracking-widest text-muted">Entries</span>
             </div>
             <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10"></div>
             <div className="flex flex-col items-center">
               <span className="font-bold text-ink text-lg">{followerCount}</span>
               <span className="text-[10px] uppercase tracking-widest text-muted">Followers</span>
             </div>
          </div>

          <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted/40">
            Joined {new Date(author.joinedAt).toLocaleDateString()}
          </div>

          {user && user.uid !== author.id && (
            <button 
              onClick={toggleFollow} 
              className={`mt-8 px-8 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-2 mx-auto ${
                following 
                  ? "bg-transparent border border-muted text-muted hover:border-red-500 hover:text-red-500" 
                  : "btn-primary shadow-lg hover:shadow-accent/20"
              }`}
            >
              {following ? <FiUserCheck /> : <FiUserPlus />}
              {following ? "Unfollow" : "Follow Author"}
            </button>
          )}
        </div>
      </div>

      {/* Masonry Feed */}
      <div className="flex items-center gap-4 mb-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif font-bold text-ink">Published Works</h2>
        <div className="h-[1px] flex-grow bg-black/10 dark:bg-white/10"></div>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted py-10">This author has not published yet.</p>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {posts.map((entry, idx) => (
            <div key={entry.id} className="break-inside-avoid mb-8">
              <FragmentCard 
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