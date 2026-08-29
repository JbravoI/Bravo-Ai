# Bravo Ai Documentation

Start here when working on product, architecture or implementation planning for Bravo Ai.

For agent/LLM navigation, read `docs/AGENT_START_HERE.md` first.

## Planning Surfaces

- `docs/` explains product decisions, architecture and feature intent.
- `features/` contains Gherkin acceptance scenarios.
- `implementation/` contains epics, features and delivery status.
- `docs/TRACEABILITY_MAP.md` maps product areas to docs, Gherkin specs, implementation epics and code surfaces.
- `implementation/CURRENT_STATUS.md` records what is actually shipped versus still seed data or simulated.

## Relationship To Existing Root Documents

This structure formalizes and supersedes-in-detail the planning documents that were written before it existed:

- `../STRATEGY.md` — the original phased migration plan (prototype to production). Its phases map directly to the epics under `implementation/`. Kept as historical reference.
- `../test.md` — per-phase manual testing checklist. Still current; referenced from `implementation/`.
- `../deployment.md` — Vercel deployment steps. Still current; referenced from `docs/operations/`.
- `../REGWATCH_CODE_REVIEW.md` — the original prototype code review. Its findings are the source for several `docs/decisions/` entries and `docs/architecture/04-security-privacy.md`.

Where this structure and an older root document disagree on current status, this structure wins — it is updated as code changes; the root documents are point-in-time snapshots.
