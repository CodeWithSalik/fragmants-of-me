// lib/checkAdmin.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // or "@/lib/firebase" depending on setup

export async function checkIfAdmin(uid) {
    if (!uid) return false;
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() && snap.data().role === "admin";
}
