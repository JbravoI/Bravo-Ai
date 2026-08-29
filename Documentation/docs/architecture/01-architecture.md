# Architecture

## Architectural Style

A single Next.js application (App Router, TypeScript) serving both the frontend and its own backend via Route Handlers under `app/src/app/api/`. One deployable app, one repository — deliberately not split into separate frontend/backend services. See `../decisions/0001-nextjs-vercel-postgres.md`.

## Layers

### UI (`app/src/app/**/page.tsx`, `app/src/components/`)

Server Components by default; `"use client"` only where interactivity, browser APIs or React state require it (filter tabs, the regulation modal, forms, the Q&A panel). Shared page chrome (`TopBar`, `Sidebar`, `RegulationModal`) lives in the root layout, wrapped in `RegulationModalProvider` (`app/src/context/RegulationModalContext.tsx`) so any page can open the same regulation detail overlay.

### Data (`app/src/lib/data.ts`, `app/src/lib/types.ts`)

Currently the single source of truth for regulations, audit entries, jurisdictions and impact rows — explicitly commented as seed data standing in for Phase 2's Postgres store. `app/src/lib/types.ts` defines the shapes (`Regulation`, `AuditEntry`, `Jurisdiction`, `ImpactRow`, `ChatMessage`) that both the UI components and the API routes consume.

### API (`app/src/app/api/**/route.ts`)

Route Handlers exposing the same data over HTTP: `GET /api/regulations` (+ `/{id}`), `GET /api/audit`, `GET /api/impact`, `GET /api/jurisdictions`, `POST /api/scan` (simulated), `POST /api/query` (not yet implemented, returns `501`). Documented by a hand-written OpenAPI spec at `GET /api/openapi.json`, browsable at `/api-docs`. See `02-api-and-client-integration.md`.

### Frontend/API Coupling (Current State)

As of Epic 02, the UI pages still import `app/src/lib/data.ts` directly rather than fetching from the API routes — the routes exist and work, but nothing in the UI calls them yet. This is a known, intentional gap; closing it (or replacing `app/src/lib/data.ts` with real Postgres queries behind both) is Epic 02's remaining work. Do not assume the API routes are in the render path just because they exist.

## Target Runtime Components (Not All Built Yet)

- Next.js app (UI + API routes) — **built**, seed-data-backed.
- Postgres database (regulations, versions, audit log, preferences) — **not built**. See `03-data-model.md`.
- Scheduled ingestion job hitting `/api/scan` — **not built**. See `../../STRATEGY.md` Phase 5.
- Auth (Auth.js or equivalent) — **not built**. See `../../STRATEGY.md` Phase 3.
- AI provider integration (Anthropic, called server-side) — **not built**. See `../decisions/0002-anthropic-server-side-ai.md`.

## Why Next.js On Vercel

The founder's explicit preference, confirmed over a Firebase/GCP alternative that was scoped and compared. See `../decisions/0001-nextjs-vercel-postgres.md` for the comparison and reasoning.

## Verification Layers (Current)

- `npm run build` — TypeScript + Next.js production build, run after every structural change.
- `npm run lint` — ESLint, including Next.js's own rules (e.g. `@next/next/no-css-tags`, which caught a real issue during Epic 02).
- Manual per-phase verification checklist: `../../test.md`.

No automated test suite exists yet (unit or integration). Planned for Epic 06 (hardening).
