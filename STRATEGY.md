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
├── lib/ingest/              Source connectors (FCA, PRA, HMT, EU) + normalizer
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

### Phase 4 — Secure the AI Q&A path
- Move the `fetch` in `callAPI()` server-side into `/api/query`. Client sends only the question; server attaches the system prompt and the API key from env vars.
- Server should authenticate the caller, rate-limit, timeout/retry, and log the exchange to `qa_log` (this doubles as the compliance audit trail for AI usage — important since answers may inform regulatory decisions).
- Replace `innerHTML` in `addMsg()`/`addErr()` with `textContent`, or render Markdown through a sanitizer (e.g. DOMPurify) if the AI response needs formatting.

### Phase 5 — Real ingestion
- Build one source connector first (e.g. FCA — many regulators publish RSS/Atom feeds or have public APIs) end-to-end: fetch → normalize → diff against last version → write to `regulations`/`regulation_versions` → append `audit_log` entry.
- Wire "Scan Now" to actually invoke this job and reflect real status/timestamps (`Last scan` should reflect the last completed ingestion run, not a random number).
- Add the remaining sources (PRA, HM Treasury, EU) once the pattern is proven.
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

## 5. Decisions

**Confirmed:**

- **Framework & hosting:** Next.js/TypeScript on Vercel, with managed Postgres (Supabase/Neon/etc.). No Firebase/GCP — Firestore's document model was considered and rejected in favor of Postgres's relational querying (joins, sort-by-deadline, multi-field filtering) which the compliance/impact/audit views need.
- **AI provider:** Anthropic (Claude), called server-side from `/api/query`. The existing prototype's request shape (`system`, `messages: [{role, content}]`, `max_tokens`) already matches Anthropic's Messages API format, so Phase 4 is mostly "move this fetch server-side and add the real key," not a rewrite. Consider enabling Anthropic's web search tool for the Q&A panel as a supplement to the ingestion pipeline (Phase 5 stays the source of truth for the structured dashboard/audit data; web search just lets Q&A answer about things the last scan hasn't caught yet).

**Still open — flag if any should change:**

1. **Regulatory data sourcing:** are FCA/PRA/HMT/EU feeds to be scraped, or is there a licensed data provider in mind? Scraping public regulator sites is generally fine but should be checked against each site's terms.
2. **Multi-tenant or single-org?** Determines whether `org_id` scoping is needed now or can wait.
3. **Vercel/Supabase-equivalent budget** — confirm no constraint rules these out before Phase 2.

## 6. Definition of done

- No `const REGS/AUDIT/JURISDICTIONS/IMPACT = [...]` shipped to the browser as the source of truth.
- No API key or secret present in any browser-visible bundle.
- Refreshing the page does not lose preferences, jurisdictions, or audit history.
- "Scan Now" reflects a real ingestion run with a real timestamp.
- Every regulation shown links back to a real source document and retrieval date.
- `innerHTML` is not used with any string built from user input, AI output, or external data.
