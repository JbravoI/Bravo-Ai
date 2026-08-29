# Implementation Agent Index

This folder is the execution plan. It should answer what to build next, what is already done, and which surface owns each piece of work.

## Status Vocabulary

- `Pending`: planned, not yet started.
- `Ongoing`: started or partially complete.
- `Completed`: implemented and verified enough to be treated as available.

Do not introduce additional status labels without updating `README.md`.

## Canonical Epics

| Epic | Status | Notes |
| :--- | :---: | :--- |
| Epic 00 Rebrand And Baseline Hygiene | `Completed` | RegWatch → Bravo Ai rebrand applied to the static prototype; the `.ftab` cross-contamination bug fixed. |
| Epic 01 App Skeleton | `Completed` | Real Next.js routes, components, semantic/keyboard-operable UI. Verified: build, lint, all 7 routes return 200 with no console errors. |
| Epic 02 Backend And Data Model | `Ongoing` | API routes built and documented (OpenAPI + Swagger UI at `/api-docs`), all backed by seed data. Postgres not provisioned; UI doesn't call the routes yet. |
| Epic 03 Auth And Persistence | `Pending` | Blocked on Epic 02's database landing. |
| Epic 04 Secure AI Q&A | `Pending` | Provider chosen (Anthropic, see `../docs/decisions/0002-anthropic-server-side-ai.md`); not implemented. `/api/query` currently returns `501`. |
| Epic 05 Real Regulatory-Source Ingestion | `Pending` | Depends on Epic 02 (database) and a sourcing decision (scrape vs. licensed provider). |
| Epic 06 Hardening | `Pending` | CSP, full modal focus-trap/restore, mobile nav, ISO 8601 dates, first automated tests. |
| Epic 07 Deploy And Operate | `Pending` | See `../deployment.md` for the manual steps; this epic is about making it a repeatable, monitored deploy. |

## Agent Workflow

1. Start with this file and `README.md`.
2. Read the epic's `index.md`.
3. Cross-check `../docs/AGENT_START_HERE.md` and `../features/AGENT_INDEX.md`.
4. Update statuses and acceptance criteria when code behavior changes — in the same change, not as follow-up cleanup.
5. If a change affects `CURRENT_STATUS.md`'s table, update that too.
