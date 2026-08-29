# Implementation Flow & Master Status Tracker

This directory contains the build plan for Bravo Ai, structured as epics that map directly to the phases in `../STRATEGY.md`.

For agent/LLM navigation, read `AGENT_INDEX.md` first. For the fastest "what's actually real" answer, read `CURRENT_STATUS.md`.

---

## Status Legend

- `Completed`: implemented and verified (build + lint clean, manually checked per `../test.md`).
- `Ongoing`: work is actively in progress.
- `Pending`: planned, not yet started.

---

## Master Progress Dashboard

| Epic | Title | Status | Target Surface(s) |
| :--- | :--- | :---: | :--- |
| [Epic 00](epic-00-rebrand-baseline/index.md) | Rebrand And Baseline Hygiene | `Completed` | `bravo-ai.html` (static prototype — since removed, superseded by Epic 01) |
| [Epic 01](epic-01-app-skeleton/index.md) | App Skeleton | `Completed` | Next.js app (`app/src/app/`, `app/src/components/`, `app/src/context/`) |
| [Epic 02](epic-02-backend-data-model/index.md) | Backend And Data Model | `Ongoing` | `app/src/app/api/**`, `app/src/lib/data.ts`, Postgres (not yet provisioned) |
| [Epic 03](epic-03-auth-persistence/index.md) | Auth And Persistence | `Pending` | Auth.js (or equivalent), `app/src/app/api/**` |
| [Epic 04](epic-04-secure-ai-qa/index.md) | Secure AI Q&A | `Pending` | `app/src/app/api/query/route.ts`, Anthropic API |
| [Epic 05](epic-05-real-ingestion/index.md) | Real Regulatory-Source Ingestion | `Pending` | `app/src/app/api/scan/route.ts`, scheduled job |
| [Epic 06](epic-06-hardening/index.md) | Hardening | `Pending` | Whole app — CSP, a11y, tests |
| [Epic 07](epic-07-deploy-operate/index.md) | Deploy And Operate | `Pending` | Vercel project |

---

## Directory Structure

```text
implementation/
|-- README.md                # this file
|-- AGENT_INDEX.md            # agent navigation contract
|-- CURRENT_STATUS.md         # fast current-truth ledger
|-- epic-00-rebrand-baseline/index.md
|-- epic-01-app-skeleton/index.md
|-- epic-02-backend-data-model/index.md
|-- epic-03-auth-persistence/index.md
|-- epic-04-secure-ai-qa/index.md
|-- epic-05-real-ingestion/index.md
|-- epic-06-hardening/index.md
`-- epic-07-deploy-operate/index.md
```

Each epic's `index.md` lists its features, status, and acceptance criteria. Epics are not further split into `features/`/`tasks/` subfolders the way a larger, multi-engineer project might — Bravo Ai's current scope doesn't warrant that depth yet. Split an epic into that structure if and when its own scope grows large enough to need it.
