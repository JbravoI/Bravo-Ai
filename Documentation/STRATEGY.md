# Bravo Ai — Strategy: Prototype to Production Web App

## 0. Where things stand today

| File | Status |
|---|---|
| `Regwatch code.txt` | Original prototype source. Left untouched as a reference/backup. |
| `bravo-ai.html` | Same prototype, rebranded (RegWatch → Bravo Ai) and wrapped as a standalone HTML5 document so it opens directly in a browser. **Still a static, client-only demo** — no backend, no real data, no persistence. |
| `REGWATCH_CODE_REVIEW.md` | Code review of the original prototype. Its findings (hard-coded data, XSS risk via `innerHTML`, exposed API key, non-persistent state, accessibility gaps) are the input to this strategy. |

The rebrand was a text/identifier substitution only: `#regwatch` → `#bravo-app`, `rw-*` ids → `ba-*`, `rwFoo()` functions → `baFoo()`, logo/copy/system-prompt/API strings updated. No behavior changed. This is cosmetic — it does **not** address the "not a demo" requirement. Everything below is what does.

## 1. What "not a demo" actually means here

A demo can hard-code its data and fake its network calls. A product cannot. Concretely, "done" means:

- Regulatory data (alerts, deadlines, readiness scores, impact map) is **fetched from a real database that a backend process keeps up to date**, not from a `const REGS = [...]` array shipped in the page.
- The "Scan Now" button triggers a **real fetch/ingestion job** against actual regulator sources, not a 2.2s `setTimeout`.
- The AI Q&A calls a **server-side endpoint that holds the API key**, not a browser-side `fetch` with `Authorization: Bearer <key>` visible to anyone who opens dev tools.
- User preferences, jurisdictions, and the audit trail **survive a page refresh and are per-user**, not held in a JS closure that resets on reload.
- Content injected via `innerHTML` is either escaped or comes from a source the app controls — no path from "external regulation text" or "AI response" to unsanitized `innerHTML`.

Everything else (visual design, page structure, nav) can stay close to what exists — it's the data and control flow underneath that has to become real.

## 2. Target architecture

Recommended stack — optimized for one cohesive, single-deploy web app rather than a static page plus a separate service:

```
Next.js (App Router, TypeScript)
├── app/                     UI routes (dashboard, alerts, compliance, search, impact, audit, prefs)
├── app/api/                 Server routes — the ONLY place secrets and outbound calls live
│   ├── query/               Proxies AI Q&A to the model provider, injects the system prompt server-side
│   ├── scan/                Triggers/reports on ingestion runs
│   ├── regulations/         CRUD-ish reads over stored regulation records
│   ├── preferences/         Per-user jurisdiction/alert settings
│   └── audit/               Append-only audit log reads
├── lib/db/                  Database client + schema (Prisma or Drizzle)
├── lib/ingest/              Source connectors (FCA, PRA, HMT, EU; Nigeria after source approval) + normalizer
├── auth/                    Auth.js (NextAuth) — who's allowed to see this org's data
└── worker/                  Scheduled ingestion job (cron, or a queue consumer)
```

Why this shape:
- **One deployable app.** Next.js API routes give you a real backend without standing up a second service/repo — matches "single web app."
- **Secrets never reach the browser.** The AI provider key, the DB connection string, and any regulator-source credentials live only in server environment variables.
- **Same rendering model, different data source.** The existing render functions (`renderAlerts`, `renderCompliance`, `renderImpact`, `renderAudit`, `renderJuri`) map almost directly onto React components that fetch from `/api/*` instead of reading `const REGS`.

Suggested defaults (swap freely, these aren't load-bearing):
- **DB:** Postgres (Supabase, Neon, or RDS) — relational fit for regulations/versions/audit/prefs.
- **ORM:** Prisma or Drizzle.
- **Auth:** Auth.js with email/SSO — compliance tooling implies real user accounts, not anonymous access.
- **AI provider:** call server-side via the vendor SDK; keep `SYS` (the system prompt) on the server so it can't be overridden from the client.
- **Hosting:** Vercel (pairs with Next.js) or any Node host; Postgres hosted separately.
- **Ingestion scheduling:** Vercel Cron / a small worker process hitting `/api/scan` on a schedule.

## 3. Data model (sketch)

```
regulations
  id, regulator, source, title, type, summary, published_date,
  retrieved_at, document_url, document_version, priority, status,
  deadline, readiness_pct, created_at, updated_at

regulation_versions            -- track what changed between scans
  id, regulation_id, diff_summary, captured_at

regulation_tags / impact_areas -- normalize the current `tags`/impact table
  regulation_id, area (Banking/Investment/Insurance/Compliance/Operations), level

audit_log                      -- append-only
  id, org_id, user_id, ts, event_type, detail

user_preferences
  user_id, jurisdictions (jsonb or join table), alert_thresholds (jsonb), industry_focus (jsonb)

qa_log                         -- every Q&A exchange, for compliance traceability
  id, user_id, question, answer, cited_regulation_ids, ts
```

`readiness_pct`, dashboard counts, and badges are then **computed from queries**, not written into the page.

## 4. Migration phases

Each phase should leave the app in a working, deployable state.

### Phase 0 — Rebrand & baseline hygiene *(done for the static file; repeat inside the real app once scaffolded)*
- Brand text, ids, function names → Bravo Ai (already applied to `bravo-ai.html`).
- Fix the `.ftab` selector bug noted in the review: `rwFilter`/`baFilter` currently selects *every* `.ftab` on the page, so filtering alerts also toggles the unrelated Preferences → Industry Focus buttons. Scope filter groups to their own container.

### Phase 1 — App skeleton
- Scaffold the Next.js app; move the existing markup into route components/pages (Dashboard, Alerts, Compliance, Search, Impact, Audit, Preferences).
- Replace inline `onclick=""`/`onkeydown=""` with `addEventListener`/React event handlers (needed for CSP later, and just better practice).
- Replace clickable `<div>`s (nav items, alert cards, jurisdiction pills) with `<button>`/semantic elements; add keyboard support and focus styles.

### Phase 2 — Backend & data model
- Stand up Postgres + ORM using the schema above.
- Build `/api/regulations`, `/api/audit`, `/api/preferences` routes.
- Point the UI's render logic at these routes instead of `REGS`/`AUDIT`/`JURISDICTIONS` constants. Seed the DB with the current 7 sample records so the UI keeps working during the transition — mark them clearly as seed/demo rows so they're easy to purge later.

### Phase 3 — Auth & persistence
- Add Auth.js; gate the app behind login.
- Wire preferences/jurisdictions/alert thresholds to `user_preferences`, loaded on login and saved on change.
- Audit log renders from the DB and updates immediately after any action (scan, preference change, Q&A) — no more "navigate away and back to refresh."

### Phase 4 — Secure the AI Q&A path *(completed)*
- Move the `fetch` in `callAPI()` server-side into `/api/query`. Client sends only the question; server attaches the system prompt and the API key from env vars.
- Server should authenticate the caller, rate-limit, timeout/retry, and log the exchange to `qa_log` (this doubles as the compliance audit trail for AI usage — important since answers may inform regulatory decisions).
- Replace `innerHTML` in `addMsg()`/`addErr()` with `textContent`, or render Markdown through a sanitizer (e.g. DOMPurify) if the AI response needs formatting.

### Phase 5 — Real ingestion
- Build one source connector first (e.g. FCA — many regulators publish RSS/Atom feeds or have public APIs) end-to-end: fetch → normalize → diff against last version → write to `regulations`/`regulation_versions` → append `audit_log` entry.
- Wire "Scan Now" to actually invoke this job and reflect real status/timestamps (`Last scan` should reflect the last completed ingestion run, not a random number).
- Add the remaining sources (PRA, HM Treasury, EU) once the pattern is proven.
- Nigeria is an active jurisdiction with CBN MPC, SEC Nigeria, NAICOM, PenCom and FRC coverage. NDIC, FCCPC, NDPC, NFIU and NGX RegCo are now opt-in per-user feeds: selections trigger an immediate scan into session-scoped records that are cleared on sign-out. Continue assessing source terms and stable publication surfaces, beginning with CBN circulars. See `docs/research/nigeria-regulatory-sources.md`.
- Every regulation record should carry its source URL and retrieval date so summaries are traceable back to the original text — required for a compliance tool to be trustworthy.

### Phase 6 — Hardening
- Content-Security-Policy now enforceable since inline handlers are gone.
- Accessibility pass: dialog semantics + focus trap for the modal, mobile nav (sidebar currently just disappears under 700px with no replacement), responsive/scrollable tables.
- Use ISO 8601 internally for all dates; format for display at render time only.
- Basic tests: at minimum, ingestion normalizer, `/api/*` route handlers, and the filter/render logic.

### Phase 7 — Deploy & operate
- Deploy to chosen host, connect managed Postgres, configure env vars/secrets.
- Set up the scheduled ingestion trigger.
- Basic monitoring: ingestion failures, API error rates, Q&A latency/cost.

### Phase 8 — Information navigation, filtering and alert acknowledgement
- Introduce one reusable, accessible paginated-list pattern for the Dashboard feed, Alerts, Compliance Readiness, Impact Map and Audit Trail. Show items 1–10 by default and let the user choose 10, 20, 30, 50 (and, where safe, all) items per page. Preserve the current jurisdiction, filters, sort and page size while moving between pages.
- Add Dashboard feed controls that sort by newest/oldest publication date and risk (High, Medium, Low), and filter by regulator, status, deadline/review state and industry tag. Include a clear-all action and an explicit empty state so users can tell the difference between “no records” and “no records match these filters.”
- Treat opening the Alerts area as an acknowledgement action: when a signed-in user navigates to `/alerts`, mark all currently unread alerts in their selected jurisdiction as viewed, persist that decision in `alert_reads`, and immediately set the Alerts badge to zero. New records arriving after that point remain unread. This must be an authenticated, auditable bulk operation and must not mark records in another jurisdiction as read.
- Keep opening an individual card as an acknowledgement action too, so direct links and Dashboard card interactions remain consistent.
- Give the Impact Map equivalent controls: sort by regulation, highest impact or breadth of affected business areas; filter by one business area and a minimum impact threshold; and provide the same clear action and explicit empty state.
- Apply the same scalable navigation pattern to the Admin dashboard: paginate users and open password-reset requests, filter users by role and account-lock status, filter reset requests by state, and provide predictable sort and clear controls. Administrative actions must still operate on the actual record, regardless of the current page or filters.

### Phase 9 — Personalised product presentation and appearance
- Expand the public landing page with a concise, non-marketing-only “What Bravo Ai does” article: explain the source scan → prioritisation → impact/review → audit workflow, what a new user sees after sign-in, and that source documents remain the authoritative reference. Keep it readable without exposing API documentation or secrets.
- Add a saved Appearance preference with Light, Dark and Browser/System choices. “Browser/System” follows the operating-system colour scheme; Light and Dark explicitly override it. Apply the selected theme before the page is painted to avoid a distracting theme flash, maintain accessible contrast, and retain the choice across sign-in sessions.
- In jurisdiction choices and labels, prefix EU, US, HK, SG and CH with `*Beta`. UK and Nigeria are not beta. Beta labeling must be present anywhere these jurisdictions can be selected or described, not only on the Preferences screen.

### Phase 10 — Compliance assessment and score model *(completed)*
- Replace seed/manual `readiness` percentages with a traceable readiness assessment workflow. A permitted compliance user can record an assessment for a regulation: owner, assessment date, implementation/review status, percentage, evidence/reference, rationale and next review date. The history is append-only rather than silently overwriting a prior assessment.
- Define and display the compliance-score calculation. It is the rounded average of the latest readiness assessment for applicable regulations in the selected jurisdiction; records that have never been assessed are excluded and the assessed/total denominator is displayed. Priority- and deadline-weighted scoring remains deferred until the business agrees the weighting policy.
- Make the Compliance Readiness table explain its status colours (green ≥70%, amber 40–69%, red <40%) and distinguish “not assessed” from `0%`. The dashboard should link to the underlying filtered records and identify the calculation timestamp.
- Audit every readiness change, score-affecting inclusion/exclusion and bulk alert acknowledgement. Add unit and route tests for pagination, filtering, jurisdiction scoping, theme persistence, readiness calculation and permission boundaries.

## 5. Decisions

**Confirmed:**

- **Framework & hosting:** Next.js/TypeScript on Vercel, with managed Postgres (Supabase/Neon/etc.). No Firebase/GCP — Firestore's document model was considered and rejected in favor of Postgres's relational querying (joins, sort-by-deadline, multi-field filtering) which the compliance/impact/audit views need.
- **AI provider:** Gemini 3.6 Flash, called server-side from `/api/query` using `GEMINI_API_KEY`. Gemini 2.5 Flash is unavailable to new API users, so this is the compatible free-tier successor. The endpoint authenticates callers, limits free-tier requests, times out and retries transient failures, and records completed exchanges in `qa_log`. Search grounding is not enabled; Phase 5 remains the source of truth for structured dashboard and audit data.

**Still open — flag if any should change:**

1. **Regulatory data sourcing:** are FCA/PRA/HMT/EU and proposed Nigeria regulator feeds to be scraped, or is there a licensed data provider in mind? Scraping public regulator sites is generally fine but should be checked against each site's terms. Nigeria's proposed source register is in `docs/research/nigeria-regulatory-sources.md`.
2. **Multi-tenant or single-org?** Determines whether `org_id` scoping is needed now or can wait.
3. **Vercel/Supabase-equivalent budget** — confirm no constraint rules these out before Phase 2.

## 6. Definition of done

- No `const REGS/AUDIT/JURISDICTIONS/IMPACT = [...]` shipped to the browser as the source of truth.
- No API key or secret present in any browser-visible bundle.
- Refreshing the page does not lose preferences, jurisdictions, or audit history.
- "Scan Now" reflects a real ingestion run with a real timestamp.
- Every regulation shown links back to a real source document and retrieval date.
- `innerHTML` is not used with any string built from user input, AI output, or external data.
