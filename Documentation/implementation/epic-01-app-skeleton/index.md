# Epic 01: App Skeleton

**Status:** `Completed`
**Maps To:** `../../STRATEGY.md` Phase 1
**Target Surface(s):** Next.js app (`app/src/app/`, `app/src/components/`, `app/src/context/`, `app/src/lib/`)

---

## Overview

Scaffold a real Next.js application and move the static prototype's markup into route components, replacing fake client-side page-switching with real routes, inline event handlers with React handlers, and clickable `<div>`s with keyboard-operable semantic elements.

---

## Work Completed

- Scaffolded Next.js 16.3.3 (App Router, TypeScript) at the repo root; removed Tailwind (unused — the app has its own hand-rolled design system).
- Seven real routes: `/`, `/alerts`, `/compliance`, `/search`, `/impact`, `/audit`, `/prefs`, replacing the original show/hide-div fake navigation.
- All inline `onclick`/`onkeydown` replaced with React event handlers; all clickable `<div>`s replaced with real `<button>`s or `<tr role="button" tabIndex={0}>` with Enter/Space handling where a `<button>` can't legally wrap a table row.
- `app/src/context/RegulationModalContext.tsx` — shared modal state so any page can open the same regulation detail overlay.
- Fonts moved to `next/font/google` (self-hosted) instead of a render-blocking Google Fonts `<link>`.
- Seed data centralized in `app/src/lib/data.ts` / `app/src/lib/types.ts`, clearly commented as standing in for Phase 2's database.

## Deliberate Deviations From A 1:1 Port

- The original `.ftab` cross-contamination bug (fixed in Epic 00) is now structurally impossible to recur — Dashboard, Alerts and Preferences are separate route components with independent filter state, not a shared DOM query.
- Dropped the original's random "Last scan: N min ago" label (flagged by the code review as fake/unreliable) in favor of a static "Last scan: just now" until Epic 05 gives it a real timestamp.
- Search-box Enter no longer auto-submits the AI question (original prototype behavior); it pre-fills the Q&A input and requires an explicit "Ask" click. Simplification accepted given the AI path is being rebuilt in Epic 04 anyway.

## Verification

- `npm run build`: all 7 routes compiled and prerendered, TypeScript passed.
- `npm run lint`: clean.
- Dev server: all 7 routes hit directly, returned 200, no server-side errors in log.
- Browser: opened and manually checked; one hydration warning traced to a Grammarly browser extension (not app code) and suppressed via `suppressHydrationWarning` on `<body>`, the standard fix for that known false positive.

## Acceptance Criteria

- [x] All 7 pages render as real routes with working navigation and active-state highlighting.
- [x] No inline `onclick`/`onkeydown` remain.
- [x] Every previously-clickable `<div>` is keyboard-operable.
- [x] `npm run build` and `npm run lint` both pass clean.
