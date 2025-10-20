# 09-auth — NoteHub with Auth (Next.js App Router)

Homework 09: switch to the new NoteHub API with cookie-based auth and add protected routes.

## What’s inside

- New backend (cookie auth): `https://notehub-api.goit.study` via our `app/api/*` routes.
- Route groups:
  - `(auth routes)`: `/sign-in`, `/sign-up`
  - `(private routes)`: `/profile`, all `/notes/*`
- API layer split:
  - `lib/api/api.ts` — axios instance (`withCredentials: true`, `baseURL = NEXT_PUBLIC_API_URL + '/api'`)
  - `lib/api/clientApi.ts` — CSR calls
  - `lib/api/serverApi.ts` — SSR calls (cookies → headers)
- Auth state (planned next steps): Zustand `authStore` (`user`, `isAuthenticated`, `setUser`, `clearIsAuthenticated`)
- Middleware guard (planned): `middleware.ts` (redirects unauth users to `/sign-in`, authed users away from `/sign-in|/sign-up` to `/profile`)
- `AuthProvider` (planned): client session check on transitions with loader
- Styles from HW‑09 style pack are placed in `app/styles`

## Env

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

On Vercel set:

```
NEXT_PUBLIC_API_URL=https://<your-site>.vercel.app
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run format`

## Deploy

- Vercel (App Router). Ensure env var is set.

## Final QA checklist

- [ ] `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3000`
- [ ] `app/api/*` present (proxy to notehub-api.goit.study), no `app/api/notehub/*`
- [ ] `(auth routes)` and `(private routes)` groups exist
- [ ] `AuthNavigation` shows Login/Sign up (guest) → Profile/Logout (after login)
- [ ] `middleware.ts` redirects guests from `/profile`/`/notes` to `/sign-in`
- [ ] `/sign-in` and `/sign-up` forms work; on success → `/profile`
- [ ] `/profile` shows username/email; `/profile/edit` updates username and returns to `/profile`
- [ ] TanStack Query provider is mounted in `app/layout.tsx`
