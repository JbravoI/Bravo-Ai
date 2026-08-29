# Feature Specs Agent Index

The `features/` folder contains executable behavior expectations in Gherkin. Use these files to understand what the product must do before changing implementation code.

## Canonical Feature Areas

| Area | Specs | Primary Docs | Implementation Epics |
| :--- | :--- | :--- | :--- |
| Dashboard and alerts | `01-monitoring/dashboard-and-alerts.feature` | `../docs/features/01-monitoring/` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-02-backend-data-model/` |
| Compliance readiness | `02-compliance/compliance-readiness.feature` | `../docs/features/02-compliance/` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-02-backend-data-model/` |
| Search and AI Q&A | `03-analysis/search-and-qa.feature` | `../docs/features/03-analysis/` | `../implementation/epic-04-secure-ai-qa/` |
| Impact map | `03-analysis/impact-map.feature` | `../docs/features/03-analysis/` | `../implementation/epic-02-backend-data-model/` |
| Audit trail | `04-operations/audit-trail.feature` | `../docs/features/04-operations/` | `../implementation/epic-05-real-ingestion/` |
| Preferences and jurisdictions | `04-operations/preferences-and-jurisdictions.feature` | `../docs/features/04-operations/` | `../implementation/epic-03-auth-persistence/` |
| API and Swagger docs | `05-platform/api-and-docs.feature` | `../docs/features/05-platform/` | `../implementation/epic-02-backend-data-model/` |

## Agent Rules

- Treat Gherkin as acceptance intent, not implementation detail. A scenario can describe target behavior that isn't built yet — check `../implementation/CURRENT_STATUS.md` for what's actually real today.
- If a behavior exists in docs but no Gherkin covers it, add or update a feature file before coding substantial behavior.
- If implementation changes behavior, update the matching feature spec in the same change.
- Keep scenarios concrete and user-observable.

## Honesty Rule

Every scenario that depends on not-yet-built infrastructure (a real database, a real AI provider, real regulator scanning) must be written so it still fails honestly against current code — e.g. asserting a `501` response, or that a value is `"simulated": true` — rather than being quietly skipped or written as if the feature already worked. This mirrors the "not a demo" rule that governs the rest of this documentation set: a passing test suite should never imply more is real than actually is.
