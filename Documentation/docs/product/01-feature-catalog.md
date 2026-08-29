# Feature Catalog

## 1. Public Landing Page

A public introduction to Bravo Ai, with product positioning, a dashboard preview, monitoring/AI/audit benefits, workflow overview, security messaging and clear sign-up/sign-in calls to action. The signed-in product dashboard lives at `/dashboard`.

## 2. Dashboard And Alerts

Stat cards (regulations tracked, high priority, pending review, compliance score) and a filterable feed of regulatory updates by source (FCA/PRA/HM Treasury/EU/All). Clicking an alert opens a detail view with AI summary, business impact and affected areas. Currently backed by 7 seed records, not a live scan.

Detailed doc: `../features/01-monitoring/dashboard-and-alerts.md`

## 3. Compliance Readiness

A table of every tracked regulation with regulator, status, deadline, a readiness percentage (progress bar) and priority. Rows open the same regulation detail view as alerts.

Detailed doc: `../features/02-compliance/compliance-readiness.md`

## 4. Search And AI Q&A

A knowledge-base search box with quick-question shortcuts, backed by an AI Q&A panel (also present on the dashboard). It sends authenticated requests to Gemini 3.6 Flash through the server, grounding answers in the tracked regulation set. Structured citations remain to be added.

Detailed doc: `../features/03-analysis/search-and-qa.md`

## 5. Impact Map

A table showing each regulation's impact level (High/Medium/Low/None) across five business areas: Banking, Investment, Insurance, Compliance, Operations.

Detailed doc: `../features/03-analysis/impact-map.md`

## 6. Audit Trail

A chronological log of scans, alerts, compliance-record updates and Q&A queries. Currently static seed entries; a real scan doesn't yet append to it.

Detailed doc: `../features/04-operations/audit-trail.md`

## 7. Preferences And Jurisdictions

Jurisdiction toggles (UK, EU, US, Hong Kong, Singapore, Switzerland), alert-threshold checkboxes, and industry-focus tags (Banking, Investment, Insurance, Asset Management, Fintech). Persisted per signed-in user (MongoDB `user_preferences`) — survives a refresh and doesn't leak between accounts. Alert-threshold checkboxes still don't feed into anything; no notification system exists.

Detailed doc: `../features/04-operations/preferences-and-jurisdictions.md`

## 8. API And Swagger Docs

A documented REST API (`/api/regulations`, `/api/audit`, `/api/impact`, `/api/jurisdictions`, `/api/scan`, `/api/query`) with an OpenAPI spec at `/api/openapi.json` and an interactive Swagger UI at `/api-docs`. Every read endpoint is real and callable; `/api/scan` is simulated and `/api/query` is authenticated Gemini Q&A.

Detailed doc: `../features/05-platform/api-and-docs.md`

## 9. Regulatory Source Scanning

The first live connector ingests FCA's public RSS feed into the regulatory database, preserving the original source URL and retrieval date, detecting content changes, and appending a scan audit record. PRA, HM Treasury and EU connectors remain planned. See `../../STRATEGY.md` Phase 5.

## 10. Secure AI Q&A

Server-side Gemini 3.6 Flash integration so a real API key never reaches the browser, with authenticated, regulation-grounded responses and `qa_log` traceability. See `../../STRATEGY.md` Phase 4 and `../decisions/0002-anthropic-server-side-ai.md`.

## 11. Authentication

Self-service email/password signup and sign-in (Auth.js, Credentials provider, JWT session). The landing, login and signup pages are public; the product dashboard and all working pages require a signed-in session. The read-only API surface stays public by design. No OAuth, email verification, or password reset yet. See `../decisions/0006-authjs-credentials-not-oauth.md`.

Detailed doc: `../features/00-auth/authentication.md`
