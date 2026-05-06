import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredClientKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingClientKeys = requiredClientKeys.filter((key) => !process.env[key]);
const hasFirebaseClientConfig = missingClientKeys.length === 0;

const app = hasFirebaseClientConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

if (!hasFirebaseClientConfig && process.env.NODE_ENV !== "production") {
  console.warn(
    `[firebase] Missing client env vars: ${missingClientKeys.join(", ")}. Firebase client SDK not initialized.`
  );
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const ADMIN_UID = "SIpfZSIJM5RKrvLahp7I4DLwiE93";
export const isFirebaseConfigured = hasFirebaseClientConfig;
