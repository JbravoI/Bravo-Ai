# ADR 0001: Next.js On Vercel With Postgres, Not Firebase

## Status

Accepted.

## Context

The original prototype was a single static HTML file with no backend. Turning it into a real product required choosing a hosting/runtime stack. Two concrete options were scoped:

1. Next.js (TypeScript, App Router) deployed on Vercel, with a managed Postgres database (Supabase/Neon/etc.) and Anthropic called server-side.
2. A Firebase-native stack: Firebase Hosting/App Hosting, Cloud Functions or Cloud Run for API routes, Firebase Authentication, Cloud Scheduler for ingestion, and either Firestore or Cloud SQL for storage.

The data the product needs to store — regulations with deadlines, versioned diffs, multi-field filtering across business-area impact, an audit trail — is relational in shape. Firestore's document model would work but tends to fight complex filtering and joins; Cloud SQL (Postgres) paired with Firebase would have matched the schema but added setup complexity (a Cloud SQL instance plus a connector) without a clear benefit over Vercel's native Postgres story.

## Decision

Use Next.js (App Router, TypeScript) as a single deployable application — UI and API routes in one repo, one deploy — hosted on Vercel, with a managed Postgres database. Firebase/GCP was explicitly considered and rejected for this project.

## Consequences

- One deployable app, one repository — matches the "single web app" requirement directly (see `../product/00-product-vision.md`).
- `app/src/app/api/**/route.ts` Route Handlers are the backend; no separate API service or repo.
- Scheduled ingestion (Phase 5) uses Vercel Cron Jobs, not Cloud Scheduler.
- Auth (Phase 3) uses Auth.js or an equivalent Vercel/Next-native library, not Firebase Authentication.
- The database is relational (Postgres) from day one — see `../architecture/03-data-model.md` — rather than a document store that would need denormalization for the compliance/impact views.
