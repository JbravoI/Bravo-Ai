# Epic 06: Hardening

**Status:** `Implemented — run the date migration in each environment`
**Maps To:** `../../STRATEGY.md` Phase 6
**Target Surface(s):** Whole app

---

## Overview

Close the remaining gaps between "functionally complete" and "production quality": accessibility, security headers, correct date handling, and the first automated tests.

---

## Implemented

- **Security headers**: `next.config.ts` enforces a restrictive CSP plus anti-framing, MIME-sniffing, referrer and permissions-policy protections.
- **Modal accessibility**: the regulation modal has dialog labelling, initial focus, Escape handling, a Tab/Shift+Tab focus trap, and focus restoration to its trigger.
- **Mobile navigation and tables**: a responsive menu appears below 700px and data tables retain horizontal scrolling with a minimum readable width.
- **ISO 8601 dates**: new records and seed data store ISO dates; `npm run migrate:dates` converts legacy MongoDB date strings. UI date formatting is centralised in `src/lib/dates.ts`.
- **Automated tests**: `npm test` runs Node's built-in test runner. The initial tests cover deterministic date normalization and display formatting.

## Acceptance Criteria

- [x] A CSP and complementary browser security headers are enforced.
- [x] The regulation modal traps focus while open and restores it on close.
- [x] There is a usable navigation path on mobile viewports.
- [x] New and migrated dates are stored as ISO 8601 and formatted only at render time.
- [x] Automated tests run with `npm test`.
