# API And Client Integration

## Current API Surface

All routes live under `app/src/app/api/` and are documented authoritatively by `GET /api/openapi.json` (rendered at `/api-docs`). This file explains the rules behind that contract; the OpenAPI spec is the source of truth for exact shapes.

| Route | Method | Backing | Notes |
| :--- | :--- | :--- | :--- |
| `/api/regulations` | GET | MongoDB Atlas | Optional `?source=fca\|pra\|hmt\|eu` filter |
| `/api/regulations/{id}` | GET | MongoDB Atlas | 404 if not found, 400 if `id` isn't an integer |
| `/api/audit` | GET | MongoDB Atlas | |
| `/api/impact` | GET | MongoDB Atlas | |
| `/api/jurisdictions` | GET | MongoDB Atlas | |
| `/api/scan` | POST | Simulated | Response body includes `"simulated": true` — never remove that field without the endpoint becoming real |
| `/api/query` | POST | Not implemented | Returns `501` with a message pointing at Phase 4. Do not return a canned/fake answer here — see `04-security-privacy.md` |

## Rules

1. **Every endpoint's current backing store is stated in its response or its OpenAPI description.** An endpoint must never claim to be more real than it is — no fake AI answers, no unlabeled simulated data. This is the same rule that governs `../product/00-product-vision.md`'s "not a demo" definition, applied to the API layer.
2. **Secrets never reach a Route Handler's response or a client-side `fetch`.** When Phase 4 wires up a real AI provider, the API key lives in a server-only env var, read only inside `app/src/app/api/query/route.ts`. Nothing under `app/src/components/` or client-side code should ever hold a provider API key.
3. **Route Handlers, not `pages/api`.** This app uses the App Router exclusively; do not add a `pages/` directory.
4. **Dynamic route params are `Promise`-typed** (Next.js 15+/16 convention) — `const { id } = await ctx.params`, using the generated `RouteContext<'/path/[param]'>` helper type. See `app/src/app/api/regulations/[id]/route.ts` for the pattern.
5. **The Swagger static-asset route (`app/src/app/swagger-static/[file]/route.ts`) is allowlisted by exact filename.** Do not widen it to serve arbitrary files from `node_modules` — that would be a path-traversal risk. Add new filenames to the `ALLOWED` map explicitly.

## Client Integration

The UI does **not** reach its data by having Server Components fetch their own Route Handlers over HTTP — Next.js's own docs recommend against that (it needs an absolute URL on the server and adds a network hop within the same process) in favor of a shared function both the route and the page call directly. That's what's implemented:

- `app/src/lib/data.ts` exports async accessor functions (`getRegulations`, `getRegulationById`, `getAuditEntries`, `getImpactRows`, `getJurisdictions`), each querying a MongoDB Atlas collection via `app/src/lib/mongodb.ts`. Every Route Handler above calls one of these, and so does every Server Component page that needs the same data (`app/src/app/layout.tsx` fetches the regulations list once and shares it via `RegulationModalContext`; `impact/page.tsx`, `audit/page.tsx`, `prefs/page.tsx` each fetch their own page-scoped data and pass it down as props).
- Client-side `fetch` is reserved for genuinely interactive flows that a browser action triggers: the Q&A panel's `POST /api/query` and the "Scan Now" button's `POST /api/scan` both call the real routes with relative URLs from the browser, which is exactly where a real HTTP round-trip belongs.

## AI Q&A Client Contract (Current)

`app/src/components/QAPanel.tsx` posts `{ question: string }` to the app's own `/api/query` and expects `{ answer: string }` on success or `{ error: string }` on failure — it now correctly surfaces `/api/query`'s real (still-`501`) response instead of failing against a fictional external domain. The contract may still need a citations field once Phase 4 implements the endpoint for real; update `QAPanel.tsx` and this doc together when that lands.
