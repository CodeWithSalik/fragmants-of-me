import admin from "firebase-admin";

function normalizePrivateKey(rawKey) {
  if (!rawKey) return undefined;

  // Support both escaped-newline and single-line keys pasted in Vercel.
  const keyWithLineBreaks = rawKey
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----\s*/g, "-----BEGIN PRIVATE KEY-----\n")
    .replace(/\s*-----END PRIVATE KEY-----/g, "\n-----END PRIVATE KEY-----");

  return keyWithLineBreaks;
}

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

const adminDb = admin.firestore();
const authAdmin = admin.auth();

export { adminDb, authAdmin };
