# Bravo Ai — Deploying to Vercel

There are two different things this can mean right now: deploying what exists today (the static `bravo-ai.html`), or deploying the eventual Next.js app from [STRATEGY.md](STRATEGY.md).

## Right now: get `bravo-ai.html` live (no backend, just to view/share it)

Since there's no git repo yet, the Vercel CLI can deploy the folder directly.

1. Install the CLI: `npm i -g vercel`
2. Rename or copy `bravo-ai.html` → `index.html` (Vercel serves `index.html` at the root by default; otherwise it'd only be reachable at `/bravo-ai.html`).
3. From the project folder, run `vercel` and follow the prompts — it'll ask you to log in (opens a browser for auth) and confirm project settings. Since there's no framework/build step, accept the defaults for a static deploy.
4. It prints a live URL immediately, and `vercel --prod` promotes it to your production URL.

This is a quick way to view/share the current rebranded prototype — it still calls the placeholder `api.bravoai.app` endpoint and won't have working Q&A, real data, or persistence (see [STRATEGY.md](STRATEGY.md) §1 for what "not a demo" actually requires).

## Later: deploying the real Next.js app (once Phase 1+ exists)

This is the normal Vercel flow, and it's what the "Deploy & operate" phase (Phase 7) in STRATEGY.md assumes:

1. Push the Next.js project to a GitHub repo (Vercel deploys from git, not local upload, once it's a real app with a build step).
2. In the Vercel dashboard: **New Project → Import** the repo. Vercel auto-detects Next.js, no config needed.
3. Add environment variables in **Project Settings → Environment Variables** — this is where `ANTHROPIC_API_KEY`, `DATABASE_URL` (your Postgres connection string), and any auth secrets live. These never go in the repo.
4. Every push to `main` auto-deploys to production; every PR gets its own preview URL for free — useful for testing each phase in isolation (see [test.md](test.md)) before merging.
5. Cloud cron (Phase 5's scheduled ingestion) uses **Vercel Cron Jobs**, configured via a `vercel.json` in the repo hitting `/api/scan` on a schedule.

Since there's no repo or Next.js scaffold yet, this second path isn't actionable until Phase 1 begins.
