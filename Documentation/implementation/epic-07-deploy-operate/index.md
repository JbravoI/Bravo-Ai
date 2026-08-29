# Epic 07: Deploy And Operate

**Status:** `Pending`
**Maps To:** `../../STRATEGY.md` Phase 7
**Target Surface(s):** Vercel project

---

## Overview

Turn "runs on my machine" into a real, repeatable, monitored production deployment of the Next.js app.

---

## Current State

The static `bravo-ai.html` prototype that once offered a quick no-dependency deploy path has been removed (Epic 01's real app superseded it). `../../deployment.md` now documents only one path: deploying the real Next.js app via a git-connected Vercel project — **not yet actionable**, because there's no git-connected Vercel project configured yet, and several prerequisite epics (02-05) need to be far enough along that deploying is meaningful.

This epic is about making that real.

## Planned Work

- Push the Next.js project to the GitHub repo (`https://github.com/JbravoI/Bravo-Ai.git`, already configured as `origin`).
- Import the repo into Vercel; confirm auto-detection of the Next.js build.
- Configure environment variables in Vercel project settings: database connection string, `GEMINI_API_KEY`, and auth secrets — none of these committed to the repo.
- Configure Vercel Cron Jobs for Epic 05's scheduled ingestion via `vercel.json`.
- Basic monitoring: ingestion failures, API error rates, Q&A latency/cost.

## Acceptance Criteria

- [ ] Every push to `main` auto-deploys to production; every PR gets a preview URL.
- [ ] No secret is committed to the repo or present in a client-visible bundle.
- [ ] The scheduled ingestion job actually fires on its cron in production.
