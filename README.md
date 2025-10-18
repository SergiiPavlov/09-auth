# 09-auth — NoteHub with Auth (Next.js App Router)

Homework 09: switch to the new NoteHub API with cookie-based auth and add protected routes.

## What’s inside
- New backend (cookie auth): `https://notehub-api.goit.study` via our `app/api/*` routes.
- Route groups:
  - `(auth routes)`: `/sign-in`, `/sign-up`
  - `(private routes)`: `/profile`, all `/notes/*`
- API layer split:
  - `lib/api/api.ts` — axios instance (`withCredentials: true`, `baseURL = NEXT_PUBLIC_API_URL + '/api'`)
  - `lib/api/clientApi.ts` — CSR calls (login/register/logout/session/notes)
  - `lib/api/serverApi.ts` — SSR calls (cookies → headers)
- Auth state: Zustand `authStore` (`user`, `isAuthenticated`, `setUser`, `clearIsAuthenticated`)
- Middleware guard: `middleware.ts` (redirects unauth users to `/sign-in`, authed users away from `/sign-in|/sign-up` to `/profile`)
- `AuthProvider` — client session check on transitions with loader
- Styles from HW-09 style pack (CSS Modules)

## Env
Create `.env.local`:
