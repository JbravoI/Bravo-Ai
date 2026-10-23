# Feature: Impact Map

## Product Intent

Show, per regulation, which business areas are most affected — so a firm can route the right regulation to the right internal team without reading the full source document first.

## Current Behavior

- `/impact` renders `app/src/components/ImpactTable.tsx`: one row per regulation, with an impact level (High/Medium/Low/None, color-coded) for each of five business areas — Banking, Investment, Insurance, Compliance, Operations.
- The map paginates at 10 rows by default, with 10, 20, 30 and 50-row choices. It can sort by regulation name, highest impact, or number of affected areas.
- A user can narrow the map to one business area and a minimum impact level (High, Medium or Low). The threshold is inclusive: “Medium or higher” includes High and Medium. Clear filters restores the selected jurisdiction's full map, and an explicit empty state explains when no rows match.

## Known Gaps

- Impact rows (`IMPACT` in `app/src/lib/data.ts`) are matched to regulations by title string, not by `Regulation.id` — a real data model should use a proper foreign key (see `../../architecture/03-data-model.md`'s `regulation_tags` / `impact_areas` table).
- No linkage from an impact row back to the corresponding regulation's detail modal.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Impact map"
- Gherkin: `../../../features/03-analysis/impact-map.feature`
- Implementation: `../../../implementation/epic-02-backend-data-model/`
