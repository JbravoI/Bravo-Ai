# Documentation Index

For agent/LLM navigation, read `AGENT_START_HERE.md` first.

## Product Direction

- `product/00-product-vision.md` - what Bravo Ai is and who it serves.
- `product/01-feature-catalog.md` - product area map with links to detailed docs.
- `product/02-roadmap.md` - phased delivery roadmap (mirrors `implementation/` epics).

## Architecture

- `architecture/01-architecture.md` - high-level architecture and layers.
- `architecture/02-api-and-client-integration.md` - API contract and frontend/backend integration rules.
- `architecture/03-data-model.md` - MongoDB Atlas collections (live) and planned collections.
- `architecture/04-security-privacy.md` - secrets handling, XSS, auth and data-retention notes.

## Decisions

See `decisions/` for ADR-style decisions.

## Feature Docs

Detailed feature docs live under `features/` grouped by product domain:

- `features/00-auth/`
- `features/01-monitoring/`
- `features/02-compliance/`
- `features/03-analysis/`
- `features/04-operations/`
- `features/05-platform/`

## Gherkin Specs

Executable-style feature scenarios live in `../features/` at the Documentation root and use the same grouping pattern.

## Operations

- `operations/local-development.md` - running the app locally (Node setup, dev server, build, lint).
- `../deployment.md` - deploying to Vercel.
