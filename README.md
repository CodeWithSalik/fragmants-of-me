# Fragmants of Me

Emotion-first literary/journaling platform built with Next.js + Firebase.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

- `npm run dev` – start dev server
- `npm run lint` – run ESLint (flat config)
- `npm run build` – production build + sitemap generation
- `npm run predeploy` – env validation + lint + build (required before release)

## Required environment variables

Set all variables from `.env.example` in your deployment provider:

- Firebase client keys (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase admin credentials (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- SMTP keys (`MAIL_USER`/`EMAIL_USER`, `MAIL_PASS`/`EMAIL_PASS`, `MAIL_FROM`/`FROM_EMAIL`)

## Deployment checklist

1. `npm ci`
2. `npm run predeploy`
3. Confirm sitemap generated and robots.txt present
4. Smoke-test:
   - Home, entry pages, type pages
   - Login / write flow
   - Comment + notifications flow
5. Deploy to production

## Rollback

1. Re-deploy last known-good commit/tag from your provider dashboard.
2. Restore prior environment variables if changed.
3. Re-run `npm run predeploy` on rollback commit to verify stability.
4. Verify core flows and notifications.

## Notes

- Firebase client SDK initializes only when required `NEXT_PUBLIC` vars exist.
- Canonical domain is standardized to `https://fragmants-of-me.vercel.app`.


## Common Vercel failure

If you see `Application error: a client-side exception has occurred`, verify all `NEXT_PUBLIC_FIREBASE_*` variables are present in **Production** and **Preview** environments and redeploy.

- Ensure `FIREBASE_PRIVATE_KEY` keeps its full key body. Both escaped newlines (`\n`) and pasted single-line keys are supported, but missing header/footer will fail admin init.
- In Production, do not use `http://localhost:3000` for `NEXT_PUBLIC_BASE_URL` or `FRONTEND_URL`.
