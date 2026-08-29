# Feature Catalog

## 1. Dashboard And Alerts

Stat cards (regulations tracked, high priority, pending review, compliance score) and a filterable feed of regulatory updates by source (FCA/PRA/HM Treasury/EU/All). Clicking an alert opens a detail view with AI summary, business impact and affected areas. Currently backed by 7 seed records, not a live scan.

Detailed doc: `../features/01-monitoring/dashboard-and-alerts.md`

## 2. Compliance Readiness

A table of every tracked regulation with regulator, status, deadline, a readiness percentage (progress bar) and priority. Rows open the same regulation detail view as alerts.

Detailed doc: `../features/02-compliance/compliance-readiness.md`

## 3. Search And AI Q&A

A knowledge-base search box with quick-question shortcuts, backed by an AI Q&A panel (also present on the dashboard). Intended to answer questions grounded in the tracked regulation set with citations. Not yet wired to a real AI provider — the endpoint returns `501` until Phase 4.

Detailed doc: `../features/03-analysis/search-and-qa.md`

## 4. Impact Map

A table showing each regulation's impact level (High/Medium/Low/None) across five business areas: Banking, Investment, Insurance, Compliance, Operations.

Detailed doc: `../features/03-analysis/impact-map.md`

## 5. Audit Trail

A chronological log of scans, alerts, compliance-record updates and Q&A queries. Currently static seed entries; a real scan doesn't yet append to it.

Detailed doc: `../features/04-operations/audit-trail.md`

## 6. Preferences And Jurisdictions

Jurisdiction toggles (UK, EU, US, Hong Kong, Singapore, Switzerland), alert-threshold checkboxes, and industry-focus tags (Banking, Investment, Insurance, Asset Management, Fintech). Currently client-side only state — nothing persists across a page refresh or between users.

Detailed doc: `../features/04-operations/preferences-and-jurisdictions.md`

## 7. API And Swagger Docs

A documented REST API (`/api/regulations`, `/api/audit`, `/api/impact`, `/api/jurisdictions`, `/api/scan`, `/api/query`) with an OpenAPI spec at `/api/openapi.json` and an interactive Swagger UI at `/api-docs`. Every read endpoint is real and callable; `/api/scan` is simulated and `/api/query` is not yet implemented.

Detailed doc: `../features/05-platform/api-and-docs.md`

## 8. Regulatory Source Scanning (Planned)

Real ingestion from FCA/PRA/HM Treasury/EU sources, replacing the seed data and the simulated `/api/scan`. Not yet built. See `../../../STRATEGY.md` Phase 5.

## 9. Secure AI Q&A (Planned)

Server-side proxy to an AI provider (Anthropic) so a real API key never reaches the browser, with responses grounded in and cited against the tracked regulation set. Not yet built. See `../../../STRATEGY.md` Phase 4 and `../decisions/0002-anthropic-server-side-ai.md`.

## 10. Auth And Per-User Persistence (Planned)

Real user accounts so preferences, jurisdictions and the audit trail persist per user instead of resetting on refresh. Not yet built. See `../../../STRATEGY.md` Phase 3.
