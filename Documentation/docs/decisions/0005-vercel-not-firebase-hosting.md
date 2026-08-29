# ADR 0005: Vercel, Not Firebase, For Deployment

## Status

Accepted.

## Context

Firebase was requested as the automated-deploy target (GitHub Actions → Firebase), with a stated preference for free Firebase **Hosting** specifically (the Spark-plan static-hosting product), not App Hosting.

Free Firebase Hosting serves static files only — it cannot execute `app/api/**` Route Handlers or run per-request MongoDB queries. Bravo Ai has neither property: several pages render dynamically per-request, and the API surface (`/api/regulations`, `/api/scan`, `/api/query`, etc. — see `../architecture/02-api-and-client-integration.md`) requires a running server. The Firebase products that *can* run this (App Hosting, on Cloud Run; or classic Hosting + Cloud Functions rewrites, the older and now-deprecated-in-favor-of-App-Hosting approach) both require the paid Blaze plan — Cloud Functions and Cloud Run have never been available on the free Spark plan, though Blaze's pay-as-you-go pricing has a real free quota.

Two static-export-only paths were considered and rejected:

- **Static export to free Hosting**: would require dropping `app/api/**` entirely (Next.js doesn't support Route Handlers with dynamic data in a static export) and freezing all page data to whatever existed at build time. This reverses real, verified work from Epic 02 (live MongoDB-backed pages and a real API surface) rather than building on it.
- **Blaze-plan App Hosting**: viable technically (see the App Hosting research this ADR's investigation produced), but not "free" as requested, and a second platform switch in the same session on top of the database change (ADR 0004) without a concrete need driving it.

Vercel's free Hobby tier already supports full Next.js SSR and API Route Handlers as serverless functions at no cost, and was the original hosting choice (ADR 0001) before Firebase came up.

## Decision

Deploy to Vercel, not Firebase. `.github/workflows/deploy.yml` builds and deploys to Vercel production on every push to `main`, using the Vercel CLI (`vercel pull` → `vercel build` → `vercel deploy --prebuilt`) authenticated via a `VERCEL_TOKEN` GitHub Actions secret, rather than relying solely on Vercel's own passive Git integration — this keeps an explicit `npm run lint` gate in front of every deploy.

## Consequences

- No Firebase project, service account, or IAM setup was needed for this — the App Hosting/rollout research done while investigating this request is not applied anywhere in this repo.
- `MONGODB_URI`/`MONGODB_DB` need to exist in two independent places: as GitHub Actions secrets (so the Action's local `vercel build` step — which runs outside Vercel's own servers — can statically prerender pages against live data) and in Vercel's own Project Settings → Environment Variables (so the deployed serverless functions can connect at runtime). See `../../deployment.md`.
- Atlas's Network Access list needs to permit both GitHub Actions runner IPs (dynamic/wide-ranging) and Vercel's serverless function IPs (also dynamic) — in practice this means `0.0.0.0/0` rather than a fixed IP allowlist, unless a static-egress-IP add-on is set up later.
- If Firebase is reconsidered later (e.g. moving to Blaze-plan App Hosting for GCP-ecosystem integration), this ADR and ADR 0001 are the reference points for what was already evaluated and why it wasn't chosen this time.
