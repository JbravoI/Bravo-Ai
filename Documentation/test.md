# Bravo Ai — Testing Per Phase

Each phase in [STRATEGY.md](STRATEGY.md) is scoped so it ends in a working, checkable state rather than everything landing at the end. Here's what testing looks like at each stage:

| Phase | How you'd verify it |
|---|---|
| **0 — Rebrand & bugfix** | Open in browser, confirm no "RegWatch" text remains. Click a filter tab on Alerts, then check Preferences → Industry Focus buttons didn't also toggle (the bug being fixed). |
| **1 — App skeleton** | `npm run dev`, click through every page/nav item, tab through with keyboard only, confirm focus is visible. UI should look/behave identically to the static file. |
| **2 — Backend & data model** | Hit `/api/regulations` directly (browser or curl) and see real JSON from Postgres. Confirm the dashboard now renders from that response, not from a `const REGS` array — easiest check: edit a row in the DB and refresh the page. |
| **3 — Auth & persistence** | Log in, change a jurisdiction/preference, refresh the page — it should still be set. Log in as a second test user and confirm their preferences don't leak into the first user's view. |
| **4 — Secure AI Q&A** | Ask a question, open DevTools → Network tab, confirm the API key is nowhere in the request the browser sends (only your own `/api/query` call is visible). Confirm the exchange shows up in `qa_log`. |
| **5 — Real ingestion** | Trigger "Scan Now," confirm new/changed rows actually land in `regulations`/`regulation_versions`, an `audit_log` entry is created, and "Last scan" shows the real timestamp — not a random number anymore. |
| **6 — Hardening** | Run an accessibility check (axe/Lighthouse), resize to mobile width and confirm there's a working nav, tab into the modal and confirm focus is trapped and Escape/close restores focus to the trigger. |
| **7 — Deploy** | Smoke-test the production URL end to end, confirm scheduled ingestion actually fires on its cron, confirm no secrets are exposed in the deployed bundle. |

## Beyond manual checks

For anything beyond eyeballing it, add lightweight automated coverage as you go rather than at the end:

- **Vitest/Jest** for the ingestion normalizer and API route logic (Phases 2, 5).
- **Playwright** for a couple of end-to-end flows (login → change preference → refresh, ask Q&A → get answer) once auth exists (Phase 3+).
