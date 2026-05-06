const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

const smtpCandidates = [
  ["MAIL_USER", "EMAIL_USER"],
  ["MAIL_PASS", "EMAIL_PASS"],
  ["MAIL_FROM", "FROM_EMAIL"],
];

const missing = required.filter((k) => !process.env[k]);

smtpCandidates.forEach((pair) => {
  const hasOne = pair.some((k) => Boolean(process.env[k]));
  if (!hasOne) missing.push(`${pair.join(" or ")}`);
});

if (missing.length) {
  console.error("❌ Missing required environment variables for deployment:\n");
  missing.forEach((k) => console.error(`- ${k}`));
  console.error("\nAdd these in your deployment provider before building.");
  process.exit(1);
}

console.log("✅ Environment validation passed.");
