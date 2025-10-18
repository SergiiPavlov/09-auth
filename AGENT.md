# Codex Agent Brief — NoteHub (HW‑08, App Router)

> **Purpose**: give you context and guardrails. **Do not** micromanage tasks here.  
> You must **derive your own task list** from the **official technical assignment** and the codebase state.

---

## 1) Sources of truth (follow in this order)
1. **Official HW‑08 technical assignment (lectures 15–16)** – the single source of truth.  
   - Use the exact requirements from the assignment for acceptance.  
   - If the repository already satisfies a requirement, do nothing.
2. **Current repository state** (`main`): prefer minimal diffs to meet the assignment.
3. **Style assets** (CSS Modules) from the course style repo for HW‑08.
4. **Team conventions**:
   - Next.js App Router, TypeScript, Axios, TanStack Query, Zustand (+persist), CSS Modules, Prettier.
   - Keep folder conventions: `components/*`, `types/*`, `lib/api/*`, `lib/store/*`, pages under `app/*`.

> If any instruction conflicts, prioritize the **official assignment**.

---

## 2) Scope boundaries (what you may / may not change)
- ✅ You may: add/adjust pages, metadata, API proxy/fallbacks, CSR query options, Zustand draft logic, a11y attributes.
- ❌ You may **not**: switch styling system, replace App Router, drop TypeScript, or change public APIs unless required by the assignment.
- Keep CSS Modules structure per component; do not merge styles into globals.
- Keep axios and query usage; prefer typed responses.
- Keep commits minimal and logically scoped.

---

## 3) Required end state (map onto your **own** task list)
High‑level goals derived from HW‑08 (not prescriptive tasks):

A) **Create Note via page** (no modal duplication)  
   - Creation happens at `/notes/action/create` (form with `formAction`), draft via Zustand (+persist).  
   - If a parallel modal route exists for create — remove it.

B) **SEO & Open Graph** (all target routes)  
   - `app/layout.tsx`: `metadata` with `title`, `description`, `openGraph{ title, description, url, images }`, canonical via `alternates`.  
   - `app/not-found.tsx`: same pattern.  
   - `app/notes/filter/[...slug]/page.tsx`: `generateMetadata` with top‑level `title/description` + OG (`url`, `images`).  
   - `app/notes/[id]/page.tsx`: `generateMetadata` returns **title/description + OG** in both success and fallback branches (include `url`, `images`, canonical).  
   - For `/notes/action/create`: ensure explicit OG `url` and canonical.

C) **Deterministic UX when upstream is down**  
   - API routes under `/api/notehub/*` must return 200 with **mock dataset** when upstream fails, setting `x-notehub-mock: 1` header.  
   - UI should not surface retry warnings in production.

D) **CSR query hygiene & a11y niceties**  
   - `useQuery`: consider `placeholderData: keepPreviousData`, `retry: false`, `refetchOnWindowFocus: false`, `staleTime`.  
   - `TagsMenu`: no hardcoded IDs; use `useId`, proper ARIA, and Esc‑to‑close.

> Translate these goals into your own granular steps. Do not invent extra work beyond what helps meet HW‑08.

---

## 4) QA checklist (evidence you must produce)
- **SEO**: For `/`, `/not-found`, `/notes/filter/<tag>`, `/notes/<id>`, `/notes/action/create` — page head contains OG with `title/description/url/images` and canonical.  
- **Fallback**: With upstream disabled, `/api/notehub/*` replies `200` + `x-notehub-mock: 1`. UI remains usable.  
- **Create flow**: Draft persists via reload; Submit clears draft and returns; Cancel keeps draft.  
- **A11y/UX**: Switching tags does not produce repeated warnings in DevTools; menu closes on Esc.

---

## 5) Branching & delivery
- Create a feature branch (e.g. `codex/hw08-impl`), small atomic commits.  
- Open PR to `main` with: summary of changes per HW‑08, screenshots (SEO head / Network), and local test steps.  
- The PR must pass `npm run build`.

---

## 6) If something is unclear
- Prefer self‑contained fixes based on the assignment.  
- If a requirement and codebase conflict, choose the solution with **fewest diffs** that still meets HW‑08.  
- Leave a short PR note explaining the decision.