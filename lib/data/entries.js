import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const PAGE_SIZE = 18;
export const HOME_PAGE_SIZE = 30;

function serializeDocs(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchPublicEntriesPage({ pageSize = HOME_PAGE_SIZE, cursor = null } = {}) {
  const constraints = [
    where("isPrivate", "==", false),
    orderBy("timestamp", "desc"),
    limit(pageSize),
  ];

  if (cursor) constraints.splice(2, 0, startAfter(cursor));

  const q = query(collection(db, "entries"), ...constraints);
  const snap = await getDocs(q);

  return {
    entries: serializeDocs(snap),
    nextCursor: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.size === pageSize,
  };
}

export async function fetchEntriesByTypePage({ type, pageSize = PAGE_SIZE, cursor = null }) {
  const constraints = [
    where("type", "==", type),
    where("isPrivate", "==", false),
    orderBy("timestamp", "desc"),
    limit(pageSize),
  ];

  if (cursor) constraints.splice(3, 0, startAfter(cursor));

  const q = query(collection(db, "entries"), ...constraints);
  const snap = await getDocs(q);

  return {
    entries: serializeDocs(snap),
    nextCursor: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.size === pageSize,
  };
}

export async function fetchFollowingEntriesPage({ authorIds, pageSize = 20 }) {
  if (!authorIds?.length) return { entries: [] };

  const q = query(
    collection(db, "entries"),
    where("uid", "in", authorIds.slice(0, 10)),
    where("isPrivate", "==", false),
    orderBy("timestamp", "desc"),
    limit(pageSize)
  );

  const snap = await getDocs(q);
  return { entries: serializeDocs(snap) };
}
