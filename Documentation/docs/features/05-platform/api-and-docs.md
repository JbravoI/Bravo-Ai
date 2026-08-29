# Feature: API And Swagger Docs

## Product Intent

Give the product a real, documented, independently-testable API surface — both because a real backend needs one, and because it lets the API be verified without going through the UI.

## Current Behavior

- `app/src/app/api/regulations`, `/regulations/{id}`, `/audit`, `/impact`, `/jurisdictions` — real `GET` endpoints, backed by `app/src/lib/data.ts` seed data (see `../../decisions/0003-seed-data-api-before-database.md`).
- `app/src/app/api/scan` — `POST`, simulated, response body includes `"simulated": true`.
- `app/src/app/api/query` — authenticated `POST`, calls Gemini 3.6 Flash server-side with tracked-regulation context and logs completed exchanges to `qa_log`.
- `GET /api/openapi.json` — a hand-written OpenAPI 3.0 spec describing every route above, including backing-store and simulated-status caveats.
- `/api-docs` — an interactive Swagger UI page rendering that spec, with working "Try it out" buttons. Built on `swagger-ui-dist` (framework-agnostic bundle, avoids React-version peer-dependency issues) loaded through an allowlisted static-asset route (`app/src/app/swagger-static/[file]/route.ts`) rather than vendoring the bundle into the repo.

## Known Gaps

- The UI (`app/src/app/**/page.tsx`) doesn't call these routes yet — see `../../architecture/02-api-and-client-integration.md`'s "Current Gap."
- No versioning strategy for the API yet (no `/v1/` prefix) — worth deciding before external consumers exist.
- No rate limiting or auth on any route — acceptable only because there's no sensitive data behind them yet (seed data is public-ish sample content).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "API and Swagger docs"
- Gherkin: `../../../features/05-platform/api-and-docs.feature`
- Implementation: `../../../implementation/epic-02-backend-data-model/`
