# Data Model

## Status

Built. MongoDB Atlas, not Postgres — see `../decisions/0004-mongodb-atlas-not-postgres.md` for why this differs from the original plan in `../../STRATEGY.md` §3. Connection lives in `app/src/lib/mongodb.ts`; queries live in `app/src/lib/data.ts`.

## Collections (Current)

Every document's shape matches the corresponding type in `app/src/lib/types.ts` exactly — an intentional choice so the API/OpenAPI contract needed zero changes when Postgres tables became Mongo collections. Every query projects out Mongo's own `_id`; the public shape uses a plain integer `id` field.

```
regulations         — id, regulator, source, priority, status, title, date, type,
                       summary, impact, tags[], deadline, readiness, sourceUrl?,
                       retrievedAt?, sourceId?, contentHash?
jurisdictions        — code, label, color, active
audit_log            — ts, label, detail
impact_rows          — reg, banking, invest, insure, comp, ops
users                — email, passwordHash, createdAt (Epic 03 — app/src/lib/users.ts)
                       uses Mongo's native _id as the user id, unlike the collections
                       above; a different kind of entity (auth identity, not domain data)
user_preferences     — userId, activeJurisdictionCodes[], activeIndustryFocus[], updatedAt
                       (Epic 03 — app/src/lib/preferences.ts)
```

Seeded via `npm run seed` (`app/scripts/seed.mjs`), which is idempotent — it clears each collection before inserting, so it's safe to re-run. `users`/`user_preferences` are not seeded — they're created by real signup/preference-save actions.

## Collections (Planned / Built)

```
regulation_versions   — track what changed between scans (Epic 05; not yet built)
                         { regulationId, source, sourceUrl, previousContentHash,
                           contentHash, diffSummary, capturedAt } (built for FCA)
scan_runs              — completed source-ingestion runs (Epic 05; built for FCA)
                         { source, startedAt, completedAt, fetched, newRecords, changedRecords }
qa_log                — completed Q&A exchanges (Epic 04; built)
                         { userId, userEmail, provider, model, question, answer, ts }
```

## Why Not Relational Joins

The original Postgres plan (ADR 0001) was chosen partly for relational filtering across regulation tags/impact areas. In practice the query patterns that exist today — filter regulations by one field (`source`), sort by one field, find one by `id` — don't need joins, and MongoDB's aggregation pipeline can express `regulation_versions`/`impact_rows` relationships by regulation `id` well enough. If a genuinely relational need shows up later (e.g. complex cross-collection reporting), that's a real signal to revisit, not a reason to have blocked on Postgres provisioning up front — see ADR 0004.

## Open Decisions

- **Regulatory data sourcing**: the FCA public news-and-warnings RSS feed is the first live connector. PRA, HM Treasury and EU coverage still needs a connector or licensed-provider decision; regulator feed terms should be reviewed before adding each source.
- **Multi-tenant or single-org?** Determines whether an `org_id` field is needed on `audit_log`/`qa_log` at launch or can be added later.
- **Atlas tier/scaling**: the current cluster is whatever Atlas's onboarding flow provisioned by default — revisit before real traffic (Epic 07).
