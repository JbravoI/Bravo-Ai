# Roadmap

This roadmap mirrors the phase plan in `../../STRATEGY.md`, restated as epics tracked under `../../implementation/`. Each phase there has a matching `implementation/epic-*/` folder with detailed status; this page is the short version.

| Phase | Epic | Status |
| :--- | :--- | :---: |
| 0 | Rebrand and baseline hygiene | `Completed` |
| 1 | App skeleton (real routes, components, keyboard/focus basics) | `Completed` |
| 2 | Backend and data model | `Ongoing` |
| 3 | Auth and persistence | `Pending` |
| 4 | Secure AI Q&A | `Pending` |
| 5 | Real regulatory-source ingestion | `Pending` |
| 6 | Hardening (accessibility, CSP, dates, tests) | `Pending` |
| 7 | Deploy and operate | `Pending` |

## Sequencing Rationale

Phases 0-2 build the application shell and its own API surface against seed data before any external dependency (database, AI provider, regulator source) is wired in. This keeps every phase independently demoable and testable — see `../../test.md` for the per-phase manual verification approach.

Phases 3 and 4 are ordered before Phase 5 deliberately: persistence and a secure AI path are both prerequisites for real ingestion to be trustworthy (an audit trail that doesn't persist, or an AI answer path that leaks a key, would undermine the point of adding real regulatory data).

## Definition Of Done

Restated from `../../STRATEGY.md` §6 — the roadmap isn't complete until:

- No `REGS`/`AUDIT`/`JURISDICTIONS`/`IMPACT` seed arrays are the source of truth shipped to the browser.
- No API key or secret is present in any browser-visible bundle.
- Refreshing the page does not lose preferences, jurisdictions, or audit history.
- "Scan Now" reflects a real ingestion run with a real timestamp.
- Every regulation shown links back to a real source document and retrieval date.
- `innerHTML`/`dangerouslySetInnerHTML` is never used with a string built from user input, AI output, or external data.
