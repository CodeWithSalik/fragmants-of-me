const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error("❌ Missing required environment variables for deployment:\n");
  missing.forEach((k) => console.error(`- ${k}`));
  console.error("\nAdd these in your deployment provider before building.");
  process.exit(1);
}

console.log("✅ Environment validation passed.");
