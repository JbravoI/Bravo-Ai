# Feature: API And Swagger Docs

## Product Intent

Give the product a real, documented, independently-testable API surface — both because a real backend needs one, and because it lets the API be verified without going through the UI.

## Current Behavior

- `app/api/regulations`, `/regulations/{id}`, `/audit`, `/impact`, `/jurisdictions` — real `GET` endpoints, backed by `lib/data.ts` seed data (see `../../decisions/0003-seed-data-api-before-database.md`).
- `app/api/scan` — `POST`, simulated, response body includes `"simulated": true`.
- `app/api/query` — `POST`, not yet implemented, returns `501` with a message pointing at Phase 4.
- `GET /api/openapi.json` — a hand-written OpenAPI 3.0 spec describing every route above, including the "still seed data" / "not yet implemented" caveats directly in each operation's description.
- `/api-docs` — an interactive Swagger UI page rendering that spec, with working "Try it out" buttons. Built on `swagger-ui-dist` (framework-agnostic bundle, avoids React-version peer-dependency issues) loaded through an allowlisted static-asset route (`app/swagger-static/[file]/route.ts`) rather than vendoring the bundle into the repo.

## Known Gaps

- The UI (`app/**/page.tsx`) doesn't call these routes yet — see `../../architecture/02-api-and-client-integration.md`'s "Current Gap."
- No versioning strategy for the API yet (no `/v1/` prefix) — worth deciding before external consumers exist.
- No rate limiting or auth on any route — acceptable only because there's no sensitive data behind them yet (seed data is public-ish sample content).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "API and Swagger docs"
- Gherkin: `../../../features/05-platform/api-and-docs.feature`
- Implementation: `../../../implementation/epic-02-backend-data-model/`
