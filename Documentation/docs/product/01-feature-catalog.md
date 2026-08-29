# Feature Catalog

## 1. Dashboard And Alerts

Stat cards (regulations tracked, high priority, pending review, compliance score) and a filterable feed of regulatory updates by source (FCA/PRA/HM Treasury/EU/All). Clicking an alert opens a detail view with AI summary, business impact and affected areas. Currently backed by 7 seed records, not a live scan.

Detailed doc: `../features/01-monitoring/dashboard-and-alerts.md`

## 2. Compliance Readiness

A table of every tracked regulation with regulator, status, deadline, a readiness percentage (progress bar) and priority. Rows open the same regulation detail view as alerts.

Detailed doc: `../features/02-compliance/compliance-readiness.md`

## 3. Search And AI Q&A

A knowledge-base search box with quick-question shortcuts, backed by an AI Q&A panel (also present on the dashboard). It sends authenticated requests to Gemini 3.6 Flash through the server, grounding answers in the tracked regulation set. Structured citations remain to be added.

Detailed doc: `../features/03-analysis/search-and-qa.md`

## 4. Impact Map

A table showing each regulation's impact level (High/Medium/Low/None) across five business areas: Banking, Investment, Insurance, Compliance, Operations.

Detailed doc: `../features/03-analysis/impact-map.md`

## 5. Audit Trail

A chronological log of scans, alerts, compliance-record updates and Q&A queries. Currently static seed entries; a real scan doesn't yet append to it.

Detailed doc: `../features/04-operations/audit-trail.md`

## 6. Preferences And Jurisdictions

Jurisdiction toggles (UK, EU, US, Hong Kong, Singapore, Switzerland), alert-threshold checkboxes, and industry-focus tags (Banking, Investment, Insurance, Asset Management, Fintech). Persisted per signed-in user (MongoDB `user_preferences`) — survives a refresh and doesn't leak between accounts. Alert-threshold checkboxes still don't feed into anything; no notification system exists.

Detailed doc: `../features/04-operations/preferences-and-jurisdictions.md`

## 7. API And Swagger Docs

A documented REST API (`/api/regulations`, `/api/audit`, `/api/impact`, `/api/jurisdictions`, `/api/scan`, `/api/query`) with an OpenAPI spec at `/api/openapi.json` and an interactive Swagger UI at `/api-docs`. Every read endpoint is real and callable; `/api/scan` is simulated and `/api/query` is not yet implemented.

Detailed doc: `../features/05-platform/api-and-docs.md`

## 8. Regulatory Source Scanning (Planned)

Real ingestion from FCA/PRA/HM Treasury/EU sources, replacing the seed data and the simulated `/api/scan`. Not yet built. See `../../STRATEGY.md` Phase 5.

## 9. Secure AI Q&A

Server-side Gemini 3.6 Flash integration so a real API key never reaches the browser, with authenticated, regulation-grounded responses and `qa_log` traceability. See `../../STRATEGY.md` Phase 4 and `../decisions/0002-anthropic-server-side-ai.md`.

## 10. Authentication

Self-service email/password signup and sign-in (Auth.js, Credentials provider, JWT session). Every UI page requires a signed-in session; the read-only API surface stays public by design. No OAuth, email verification, or password reset yet. See `../decisions/0006-authjs-credentials-not-oauth.md`.

Detailed doc: `../features/00-auth/authentication.md`
