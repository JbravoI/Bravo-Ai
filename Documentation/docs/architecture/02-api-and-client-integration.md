# API And Client Integration

## Current API Surface

All routes live under `app/api/` and are documented authoritatively by `GET /api/openapi.json` (rendered at `/api-docs`). This file explains the rules behind that contract; the OpenAPI spec is the source of truth for exact shapes.

| Route | Method | Backing | Notes |
| :--- | :--- | :--- | :--- |
| `/api/regulations` | GET | `lib/data.ts` seed | Optional `?source=fca\|pra\|hmt\|eu` filter |
| `/api/regulations/{id}` | GET | `lib/data.ts` seed | 404 if not found, 400 if `id` isn't an integer |
| `/api/audit` | GET | `lib/data.ts` seed | |
| `/api/impact` | GET | `lib/data.ts` seed | |
| `/api/jurisdictions` | GET | `lib/data.ts` seed | |
| `/api/scan` | POST | Simulated | Response body includes `"simulated": true` — never remove that field without the endpoint becoming real |
| `/api/query` | POST | Not implemented | Returns `501` with a message pointing at Phase 4. Do not return a canned/fake answer here — see `04-security-privacy.md` |

## Rules

1. **Every endpoint's current backing store is stated in its response or its OpenAPI description.** An endpoint must never claim to be more real than it is — no fake AI answers, no unlabeled simulated data. This is the same rule that governs `../product/00-product-vision.md`'s "not a demo" definition, applied to the API layer.
2. **Secrets never reach a Route Handler's response or a client-side `fetch`.** When Phase 4 wires up a real AI provider, the API key lives in a server-only env var, read only inside `app/api/query/route.ts`. Nothing under `components/` or client-side code should ever hold a provider API key.
3. **Route Handlers, not `pages/api`.** This app uses the App Router exclusively; do not add a `pages/` directory.
4. **Dynamic route params are `Promise`-typed** (Next.js 15+/16 convention) — `const { id } = await ctx.params`, using the generated `RouteContext<'/path/[param]'>` helper type. See `app/api/regulations/[id]/route.ts` for the pattern.
5. **The Swagger static-asset route (`app/swagger-static/[file]/route.ts`) is allowlisted by exact filename.** Do not widen it to serve arbitrary files from `node_modules` — that would be a path-traversal risk. Add new filenames to the `ALLOWED` map explicitly.

## Client Integration (Current Gap)

The UI does not currently call these routes — `app/**/page.tsx` and `components/*` import `lib/data.ts` directly. This was a deliberate scope decision when the API routes were added (see `../../implementation/epic-02-backend-data-model/index.md`), not an oversight to silently work around. When this gap closes, prefer Server Components fetching directly (no client-side waterfall) where a page doesn't need interactivity, and reserve client-side `fetch` for genuinely interactive flows (the Q&A panel, scan button, preference toggles once persisted).

## AI Q&A Client Contract (Current)

`components/QAPanel.tsx` posts `{ question: string }` to a placeholder endpoint and expects `{ answer: string }` back — this does not yet match `/api/query`'s real (still-`501`) contract. Reconciling this is part of Phase 4: `/api/query` should accept `{ question: string }` and, once implemented, respond with a real answer shape (likely including citations — see `../product/00-product-vision.md`). Update `QAPanel.tsx` and this doc together when that lands.
