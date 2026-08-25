import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import {
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

import { checkIfAdmin } from "@/lib/checkAdmin";

import ReactionLine from "@/components/ReactionLine";
import SeoHead from "@/components/SeoHead";

import { SITE_NAME, absoluteUrl } from "@/lib/seo";

import {
  FiHeart,
  FiBookmark,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiGlobe,
  FiLock,
  FiMessageSquare,
} from "react-icons/fi";

/*
 * Comments are not needed for the initial reading experience.
 * Load them only when the reader gets close to the comments section.
 */
const CommentSection = dynamic(
  () => import("@/components/CommentSection"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-16 pt-10 text-center text-muted">
        Loading reader echoes...
      </div>
    ),
  }
);

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

  /*
   * =========================================================
   * COMMENTS LAZY-LOADING
   * =========================================================
   */

  const commentsTriggerRef = useRef(null);

  const [commentsReady, setCommentsReady] =
    useState(false);

  /*
   * =========================================================
   * 1. ADMIN CHECK
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setIsAdmin(false);
      return;
    }

    checkIfAdmin(user.uid)
      .then((result) => {
        if (!cancelled) {
          setIsAdmin(result);
        }
      })
      .catch((error) => {
        console.error(
          "Admin check failed:",
          error
        );

        if (!cancelled) {
          setIsAdmin(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  /*
   * =========================================================
   * 2. FETCH ENTRY
   * =========================================================
   *
   * Only ONE Firestore document is fetched here.
   *
   * We intentionally don't fetch:
   * - likes collection
   * - views collection
   * - reactions
   * - comments
   *
   * during the initial page load.
   */

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadEntry = async () => {
      try {
        const ref = doc(
          db,
          "entries",
          id
        );

        const snap = await getDoc(ref);

        if (cancelled) return;

        if (!snap.exists()) {
          setEntry(null);
          return;
        }

        const data = snap.data();

        const nextEntry = {
          id: snap.id,
          ...data,
        };

        setEntry(nextEntry);

        if (setAmbientMood) {
          setAmbientMood(
            data.mood || "warm"
          );
        }
      } catch (error) {
        console.error(
          "Failed to load fragment:",
          error
        );

        if (!cancelled) {
          toast.error(
            "Failed to load this fragment"
          );
        }
      }
    };

    loadEntry();

    return () => {
      cancelled = true;
    };
  }, [id, setAmbientMood]);

  /*
   * =========================================================
   * 3. INITIALIZE STATS
   * =========================================================
   *
   * The entry document already contains:
   *
   * entry.likes
   * entry.views
   *
   * So there is no reason to make extra count queries
   * just to display those numbers.
   *
   * Only the current user's private state is fetched.
   */

  useEffect(() => {
    if (!entry) return;

    setLikesCount(
      Number(entry.likes || 0)
    );

    setViewsCount(
      Number(entry.views || 0)
    );

    /*
     * Logged-out readers don't need
     * private user state.
     */

    if (!user) {
      setHasLiked(false);
      setIsSaved(false);
      return;
    }

    let cancelled = false;

    const loadUserState = async () => {
      try {
        const [likeSnap, savedSnap] =
          await Promise.all([
            getDoc(
              doc(
                db,
                "entries",
                entry.id,
                "likes",
                user.uid
              )
            ),

            getDoc(
              doc(
                db,
                "users",
                user.uid,
                "saved",
                entry.id
              )
            ),
          ]);

        if (cancelled) return;

        setHasLiked(
          likeSnap.exists()
        );

        setIsSaved(
          savedSnap.exists()
        );
      } catch (error) {
        console.error(
          "Failed to load user state:",
          error
        );
      }
    };

    loadUserState();

    return () => {
      cancelled = true;
    };
  }, [entry, user]);

  /*
   * =========================================================
   * 4. RECORD VIEW IN BACKGROUND
   * =========================================================
   *
   * We intentionally wait one second before recording
   * the view so it cannot compete with page rendering.
   */

  useEffect(() => {
    if (!entry || !user) return;

    let cancelled = false;

    const recordView = async () => {
      try {
        const viewRef = doc(
          db,
          "entries",
          entry.id,
          "views",
          user.uid
        );

        const entryRef = doc(
          db,
          "entries",
          entry.id
        );

        const viewSnap = await getDoc(
          viewRef
        );

        if (
          cancelled ||
          viewSnap.exists()
        ) {
          return;
        }

        await setDoc(viewRef, {
          timestamp: serverTimestamp(),
        });

        await updateDoc(entryRef, {
          views: increment(1),
        });

        if (!cancelled) {
          setViewsCount(
            (previous) =>
              previous + 1
          );
        }
      } catch (error) {
        console.error(
          "Failed to record view:",
          error
        );
      }
    };

    const timer = setTimeout(
      recordView,
      1000
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [entry, user]);

  /*
   * =========================================================
   * 5. LAZY-LOAD COMMENTS
   * =========================================================
   */

  useEffect(() => {
    const target =
      commentsTriggerRef.current;

    if (!target || commentsReady) {
      return;
    }

    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
      setCommentsReady(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([observerEntry]) => {
          if (
            observerEntry.isIntersecting
          ) {
            setCommentsReady(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: "500px",
        }
      );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [commentsReady]);

  /*
   * =========================================================
   * 6. LIKE
   * =========================================================
   */

  const toggleLike = async () => {
    if (!user) {
      toast.error(
        "Please login to like"
      );

      return;
    }

    if (!entry) return;

    const previousLiked =
      hasLiked;

    const previousCount =
      likesCount;

    /*
     * Optimistic UI.
     */

    setHasLiked(
      !previousLiked
    );

    setLikesCount(
      previousLiked
        ? Math.max(
            0,
            previousCount - 1
          )
        : previousCount + 1
    );

    try {
      const likeRef = doc(
        db,
        "entries",
        entry.id,
        "likes",
        user.uid
      );

      const entryRef = doc(
        db,
        "entries",
        entry.id
      );

      if (previousLiked) {
        await deleteDoc(
          likeRef
        );

        await updateDoc(
          entryRef,
          {
            likes: increment(-1),
          }
        );
      } else {
        await setDoc(
          likeRef,
          {
            createdAt:
              serverTimestamp(),

            uid: user.uid,

            name:
              user.displayName ||
              "Reader",
          }
        );

        await updateDoc(
          entryRef,
          {
            likes: increment(1),
          }
        );
      }
    } catch (error) {
      console.error(
        "Like action failed:",
        error
      );

      /*
       * Roll back optimistic UI.
       */

      setHasLiked(
        previousLiked
      );

      setLikesCount(
        previousCount
      );

      toast.error(
        "Something went wrong"
      );
    }
  };

  /*
   * =========================================================
   * 7. SAVE
   * =========================================================
   */

  const toggleSave = async () => {
    if (!user) {
      toast.error(
        "Please login to save"
      );

      return;
    }

    if (!entry) return;

    const previousSaved =
      isSaved;

    /*
     * Optimistic UI.
     */

    setIsSaved(
      !previousSaved
    );

    try {
      const ref = doc(
        db,
        "users",
        user.uid,
        "saved",
        entry.id
      );

      if (previousSaved) {
        await deleteDoc(ref);

        toast.success(
          "Removed from saved"
        );
      } else {
        await setDoc(ref, {
          savedAt:
            serverTimestamp(),
        });

        toast.success(
          "Saved to collection"
        );
      }
    } catch (error) {
      console.error(
        "Save action failed:",
        error
      );

      setIsSaved(
        previousSaved
      );

      toast.error(
        "Something went wrong"
      );
    }
  };

  /*
   * =========================================================
   * 8. DELETE
   * =========================================================
   */

  const handleDelete = async () => {
    if (!entry) return;

    const confirmed =
      window.confirm(
        "Permanently delete this fragment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "entries",
          entry.id
        )
      );

      toast.success(
        "Deleted"
      );

      router.push("/");
    } catch (error) {
      console.error(
        "Delete failed:",
        error
      );

      toast.error(
        "Failed to delete"
      );
    }
  };

  /*
   * =========================================================
   * 9. PRIVACY
   * =========================================================
   */

  const togglePrivacy = async () => {
    if (!entry) return;

    const nextPrivateState =
      !entry.isPrivate;

    try {
      await updateDoc(
        doc(
          db,
          "entries",
          entry.id
        ),
        {
          isPrivate:
            nextPrivateState,
        }
      );

      setEntry({
        ...entry,
        isPrivate:
          nextPrivateState,
      });

      toast.success(
        nextPrivateState
          ? "Now Private"
          : "Now Public"
      );
    } catch (error) {
      console.error(
        "Privacy update failed:",
        error
      );

      toast.error(
        "Failed to update privacy"
      );
    }
  };

  /*
   * =========================================================
   * 10. LOADING STATE
   * =========================================================
   */

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading fragment...
      </div>
    );
  }

  /*
   * =========================================================
   * 11. DERIVED DATA
   * =========================================================
   */

  const isAuthor =
    user &&
    entry.uid === user.uid;

  const content =
    entry.content || "";

  const description =
    content
      .slice(0, 150)
      .replace(/\s+/g, " ")
      .trim() +
    (content.length > 150
      ? "..."
      : "");

  const entryPath =
    `/entry/${entry.id}`;

  const shareUrl =
    absoluteUrl(entryPath);

  /*
   * Firestore Timestamp → Date
   */

  const publishedDate =
    entry.timestamp?.toDate
      ? entry.timestamp.toDate()
      : entry.timestamp
        ? new Date(
            entry.timestamp
          )
        : null;

  const publishedAt =
    publishedDate &&
    !Number.isNaN(
      publishedDate.getTime()
    )
      ? publishedDate.toISOString()
      : null;

  const readableDate =
    publishedDate &&
    !Number.isNaN(
      publishedDate.getTime()
    )
      ? publishedDate.toLocaleDateString(
          "en-IN",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "";

  /*
   * =========================================================
   * 12. STRUCTURED DATA
   * =========================================================
   */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      entry.title,

    description,

    author: {
      "@type":
        "Person",

      name:
        entry.authorName ||
        "Unknown",
    },

    ...(publishedAt
      ? {
          datePublished:
            publishedAt,

          dateModified:
            publishedAt,
        }
      : {}),

    mainEntityOfPage:
      shareUrl,

    publisher: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        absoluteUrl("/"),
    },
  };

  /*
   * =========================================================
   * 13. PAGE
   * =========================================================
   */

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">

      {/* =========================
          SEO
      ========================== */}

      <SeoHead
        title={entry.title}
        description={description}
        path={entryPath}
        type="article"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      {/* =========================
          READING CARD
      ========================== */}

      <div className="aura-card reading-mode">

        <div className="aura-card-content px-6 py-8 md:px-12 md:py-12">

          <div className="motion-wrap">

            {/* =========================
                HEADER
            ========================== */}

            <div className="flex justify-between items-start mb-8 border-b border-black/5 dark:border-white/5 pb-6 gap-6">

              <div className="min-w-0">

                <h1 className="hero-title text-3xl md:text-4xl text-ink mb-3 leading-tight">
                  {entry.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted font-medium">

                  <span>
                    By{" "}
                    {entry.authorName ||
                      "Unknown"}
                  </span>

                  {readableDate && (
                    <>
                      <span>
                        •
                      </span>

                      <time
                        dateTime={
                          publishedAt ||
                          undefined
                        }
                      >
                        {readableDate}
                      </time>
                    </>
                  )}

                </div>

              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">

                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-ink/5 text-ink/70">
                  {entry.type ===
                  "perspective"
                    ? "Perspectives"
                    : entry.type ||
                      "Writing"}
                </span>

                {entry.mood && (
                  <span className="text-xs text-muted/60 italic capitalize">
                    {entry.mood} mood
                  </span>
                )}

              </div>

            </div>

            {/* =========================
                CONTENT
            ========================== */}

            <div className="mb-12">

              <div className="mx-auto w-full max-w-2xl text-center font-serif text-lg md:text-xl leading-[2.15] text-ink/90">

                {content
                  .split("\n")
                  .map(
                    (
                      line,
                      index
                    ) => {
                      const isEmpty =
                        line.trim() ===
                        "";

                      return (
                        <div
                          key={index}
                          className={
                            isEmpty
                              ? "h-6 md:h-8"
                              : "min-h-[2.15em]"
                          }
                        >
                          <ReactionLine
                            entryId={
                              entry.id
                            }
                            lineIndex={
                              index
                            }
                            text={line}
                          />
                        </div>
                      );
                    }
                  )}

              </div>

            </div>

            {/* =========================
                ACTION BAR
            ========================== */}

            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-black/5 dark:border-white/5">

              <div className="flex flex-wrap items-center gap-4 md:gap-6">

                {/* LIKE */}

                <button
                  type="button"
                  onClick={
                    toggleLike
                  }
                  className={`flex items-center gap-2 transition-colors ${
                    hasLiked
                      ? "text-red-500"
                      : "text-muted hover:text-red-500"
                  }`}
                  aria-label="Like fragment"
                >

                  <FiHeart
                    className={
                      hasLiked
                        ? "fill-current"
                        : ""
                    }
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    {likesCount}
                  </span>

                </button>

                {/* COMMENTS */}

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "comments-section"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      })
                  }
                  className="flex items-center gap-2 transition-colors text-muted hover:text-ink"
                  aria-label="Discuss fragment"
                >

                  <FiMessageSquare
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    Discuss
                  </span>

                </button>

                {/* SAVE */}

                <button
                  type="button"
                  onClick={
                    toggleSave
                  }
                  className={`flex items-center gap-2 transition-colors ${
                    isSaved
                      ? "text-accent"
                      : "text-muted hover:text-accent"
                  }`}
                  aria-label={
                    isSaved
                      ? "Remove from saved"
                      : "Save fragment"
                  }
                >

                  <FiBookmark
                    className={
                      isSaved
                        ? "fill-current"
                        : ""
                    }
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    {isSaved
                      ? "Saved"
                      : "Save"}
                  </span>

                </button>

                {/* VIEWS */}

                <div
                  className="flex items-center gap-2 text-muted cursor-default"
                  title="Total Views"
                >

                  <FiEye
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    {viewsCount}
                  </span>

                </div>

              </div>

              {/* SUPPORT */}

              <a
                href="https://coff.ee/codewithsalik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent-strong transition-colors"
              >
                ☕ Support Author
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* =========================
          ADMIN / AUTHOR CONTROLS
      ========================== */}

      {(isAdmin ||
        isAuthor) && (
        <div className="mt-6 flex flex-wrap justify-end gap-3 opacity-70 hover:opacity-100 transition-opacity">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/edit/${entry.id}`
              )
            }
            className="text-sm text-blue-500 hover:underline flex items-center gap-2"
          >
            <FiEdit2 />
            Edit
          </button>

          <button
            type="button"
            onClick={
              togglePrivacy
            }
            className="text-sm text-amber-500 hover:underline flex items-center gap-2"
          >

            {entry.isPrivate ? (
              <FiGlobe />
            ) : (
              <FiLock />
            )}

            {entry.isPrivate
              ? "Make Public"
              : "Make Private"}

          </button>

          <button
            type="button"
            onClick={
              handleDelete
            }
            className="text-sm text-red-500 hover:underline flex items-center gap-2"
          >

            <FiTrash2 />

            Delete

          </button>

        </div>
      )}

      {/* =========================
          COMMENTS
      ========================== */}

      <div
        ref={
          commentsTriggerRef
        }
        id="comments-section"
        className="mt-12 min-h-[120px]"
      >

        {commentsReady && (
          <CommentSection
            entryId={
              entry.id
            }
          />
        )}

      </div>

    </div>
  );
}