# Architecture

## Architectural Style

A single Next.js application (App Router, TypeScript) serving both the frontend and its own backend via Route Handlers under `app/src/app/api/`. One deployable app, one repository — deliberately not split into separate frontend/backend services. See `../decisions/0001-nextjs-vercel-postgres.md`.

## Layers

### UI (`app/src/app/**/page.tsx`, `app/src/components/`)

Server Components by default; `"use client"` only where interactivity, browser APIs or React state require it (filter tabs, the regulation modal, forms, the Q&A panel). Shared page chrome (`TopBar`, `Sidebar`, `RegulationModal`) lives in the root layout, wrapped in `RegulationModalProvider` (`app/src/context/RegulationModalContext.tsx`) so any page can open the same regulation detail overlay.

### Data (`app/src/lib/data.ts`, `app/src/lib/mongodb.ts`, `app/src/lib/types.ts`)

`app/src/lib/data.ts` exports async accessor functions backed by a live MongoDB Atlas database (not Postgres — see `../decisions/0004-mongodb-atlas-not-postgres.md`) via the cached client connection in `app/src/lib/mongodb.ts`. `app/src/lib/types.ts` defines the shapes (`Regulation`, `AuditEntry`, `Jurisdiction`, `ImpactRow`, `ChatMessage`) that both the UI components and the API routes consume — every Mongo document matches these shapes exactly.

### API (`app/src/app/api/**/route.ts`)

Route Handlers exposing the same data over HTTP: `GET /api/regulations` (+ `/{id}`), `GET /api/audit`, `GET /api/impact`, `GET /api/jurisdictions`, `POST /api/scan` (simulated), `POST /api/query` (not yet implemented, returns `501`). Documented by a hand-written OpenAPI spec at `GET /api/openapi.json`, browsable at `/api-docs`. See `02-api-and-client-integration.md`.

### Frontend/API Coupling (Current State)

The UI pages call `app/src/lib/data.ts`'s accessor functions directly (not the API routes over HTTP) — this is deliberate, not a gap; see `02-api-and-client-integration.md` for why. The Route Handlers call the same functions, so both surfaces read the same live data with no duplication.

## Target Runtime Components

- Next.js app (UI + API routes) — **built**, MongoDB-backed.
- MongoDB Atlas database (regulations, jurisdictions, audit log, impact rows; versions/preferences/qa_log planned) — **built**. See `03-data-model.md`.
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
