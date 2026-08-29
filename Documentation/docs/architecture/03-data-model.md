# Data Model

## Status

Not built. This is the target Postgres schema for Epic 02's remaining work, restated from `../../STRATEGY.md` §3 and aligned to the TypeScript shapes already defined in `app/src/lib/types.ts` so the eventual database rows map cleanly onto existing `Regulation`, `AuditEntry`, `Jurisdiction` and `ImpactRow` types.

## Tables

```
regulations
  id, regulator, source, title, type, summary, published_date,
  retrieved_at, document_url, document_version, priority, status,
  deadline, readiness_pct, created_at, updated_at

regulation_versions            -- track what changed between scans
  id, regulation_id, diff_summary, captured_at

regulation_tags / impact_areas -- normalizes Regulation.tags / ImpactRow
  regulation_id, area (Banking/Investment/Insurance/Compliance/Operations), level

audit_log                      -- append-only
  id, org_id, user_id, ts, event_type, detail

user_preferences
  user_id, jurisdictions (jsonb or join table), alert_thresholds (jsonb), industry_focus (jsonb)

qa_log                         -- every Q&A exchange, for compliance traceability
  id, user_id, question, answer, cited_regulation_ids, ts
```

## Mapping To Current Seed Data (`app/src/lib/data.ts`)

| Seed export | Target table(s) |
| :--- | :--- |
| `REGULATIONS: Regulation[]` | `regulations` (+ `regulation_tags` for `.tags`) |
| `AUDIT: AuditEntry[]` | `audit_log` (note: seed shape is `{ ts, label, detail }` — `label` becomes `event_type` on migration) |
| `JURISDICTIONS: Jurisdiction[]` | `user_preferences.jurisdictions`, once per-user rather than global |
| `IMPACT: ImpactRow[]` | `regulation_tags` / `impact_areas`, one row per regulation per business area |

## Open Decisions

- **Regulatory data sourcing**: are FCA/PRA/HMT/EU feeds scraped, or is there a licensed provider? Scraping public regulator sites is generally fine but should be checked against each site's terms before Epic 05 builds against it.
- **Multi-tenant or single-org?** Determines whether `org_id` scoping in `audit_log` is needed at launch or can be added later. Currently modeled optimistically (column present) but unused.
- **ORM**: Prisma or Drizzle — not yet chosen. Either is compatible with this schema.
