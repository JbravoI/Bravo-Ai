# Traceability Map

Use this map to connect product intent, executable scenarios, implementation epics and code surfaces.

| Product Area | Product Docs | Gherkin Specs | Implementation | Main Code Surfaces |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard and alerts | `features/01-monitoring/dashboard-and-alerts.md` | `../features/01-monitoring/dashboard-and-alerts.feature` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-02-backend-data-model/` | `app/src/app/page.tsx`, `app/src/app/alerts/page.tsx`, `app/src/components/AlertsSection.tsx`, `app/src/components/AlertCard.tsx`, `app/src/components/StatsGrid.tsx`, `app/src/components/RegulationModal.tsx`, `app/src/context/RegulationModalContext.tsx`, `app/src/app/api/regulations/` |
| Compliance readiness | `features/02-compliance/compliance-readiness.md` | `../features/02-compliance/compliance-readiness.feature` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-02-backend-data-model/` | `app/src/app/compliance/page.tsx`, `app/src/components/ComplianceTable.tsx` |
| Search and AI Q&A | `features/03-analysis/search-and-qa.md` | `../features/03-analysis/search-and-qa.feature` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-04-secure-ai-qa/` | `app/src/app/search/page.tsx`, `app/src/components/QAPanel.tsx`, `app/src/app/api/query/route.ts` |
| Impact map | `features/03-analysis/impact-map.md` | `../features/03-analysis/impact-map.feature` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-02-backend-data-model/` | `app/src/app/impact/page.tsx`, `app/src/components/ImpactTable.tsx`, `app/src/app/api/impact/route.ts` |
| Audit trail | `features/04-operations/audit-trail.md` | `../features/04-operations/audit-trail.feature` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-05-real-ingestion/` | `app/src/app/audit/page.tsx`, `app/src/components/AuditLog.tsx`, `app/src/app/api/audit/route.ts` |
| Preferences and jurisdictions | `features/04-operations/preferences-and-jurisdictions.md` | `../features/04-operations/preferences-and-jurisdictions.feature` | `../implementation/epic-01-app-skeleton/`, `../implementation/epic-03-auth-persistence/` | `app/src/app/prefs/page.tsx`, `app/src/components/JuriGrid.tsx`, `app/src/components/PrefsIndustryFocus.tsx`, `app/src/app/api/jurisdictions/route.ts` |
| API and Swagger docs | `features/05-platform/api-and-docs.md` | `../features/05-platform/api-and-docs.feature` | `../implementation/epic-02-backend-data-model/` | `app/src/app/api/**/route.ts`, `app/src/app/api/openapi.json/route.ts`, `app/src/app/api-docs/page.tsx`, `app/src/app/swagger-static/[file]/route.ts` |
| Regulatory source scanning | `../STRATEGY.md` (Phase 5) | *(none yet — add before building)* | `../implementation/epic-05-real-ingestion/` | `app/src/app/api/scan/route.ts` (currently simulated) |
| Deployment | `../deployment.md` | *(none — operational, not user-facing behavior)* | `../implementation/epic-07-deploy-operate/` | Vercel project configuration (not yet created) |

## Update Rule

When changing user-visible behavior, update at least one file in each applicable column: product docs, Gherkin spec, implementation status and code. If a column has no file yet, create it or explain why it is intentionally absent (as with regulatory source scanning above — no acceptance scenarios exist yet because Phase 5 hasn't started).
