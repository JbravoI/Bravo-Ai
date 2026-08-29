# Local Development

## Prerequisites

- Node.js (LTS). On Windows, install from nodejs.org or `winget install OpenJS.NodeJS.LTS`, then **open a new terminal** — an already-open shell won't pick up the updated PATH.

## Commands

```
npm install     # install dependencies
npm run dev     # start the dev server at http://localhost:3000
npm run build   # production build — TypeScript + Next.js, catches type/compile errors
npm run lint    # ESLint, including Next.js's own rules
```

Run `npm run build` and `npm run lint` after any structural change before considering it done — both are fast and catch real issues (an ESLint rule caught a real `<link>`-tag mistake in the Swagger docs page during Epic 02).

## Routes

| Route | What it is |
| :--- | :--- |
| `/` | Public landing page |
| `/dashboard` | Signed-in regulatory dashboard |
| `/alerts` | Full alerts feed |
| `/compliance` | Compliance readiness table |
| `/search` | Search + AI Q&A |
| `/impact` | Impact map |
| `/audit` | Audit trail |
| `/prefs` | Preferences and jurisdictions |
| `/api-docs` | Swagger UI for the API |
| `/api/openapi.json` | Raw OpenAPI spec |

## Verification Approach

There's no automated test suite yet (see `../architecture/01-architecture.md`). Until Epic 06 adds one, verify changes by:

1. `npm run build` and `npm run lint` — must both pass clean.
2. Manual click-through per the relevant row in `../../test.md`.
3. For API changes, hit the route directly (`curl` / `Invoke-WebRequest`) and confirm status codes and body shape match `/api/openapi.json`.

## Deployment

See `../../deployment.md` for deploying the Next.js app to Vercel.
