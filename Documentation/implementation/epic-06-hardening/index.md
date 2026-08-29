# Epic 06: Hardening

**Status:** `Pending`
**Maps To:** `../../../STRATEGY.md` Phase 6
**Target Surface(s):** Whole app

---

## Overview

Close the remaining gaps between "functionally complete" and "production quality": accessibility, security headers, correct date handling, and the first automated tests.

---

## Planned Work

- **Content-Security-Policy**: now enforceable since Epic 01 removed inline event handlers.
- **Modal accessibility**: `components/RegulationModal.tsx` currently has basic focus-on-open and Escape-to-close (Epic 01 baseline); add a full focus trap and focus restoration to the trigger element on close, plus proper dialog semantics review.
- **Mobile navigation**: `components/Sidebar.tsx` currently just disappears under 700px with no replacement (matches the original prototype's known limitation, deliberately not fixed in Epic 01 — see that epic's index). Add a mobile menu.
- **Responsive tables**: ensure compliance/impact tables are horizontally scrollable or convert to responsive cards on small screens.
- **ISO 8601 dates internally**: seed data currently uses display-formatted strings (`"28 Apr 2025"`); switch to ISO 8601 storage with display-time formatting once Epic 02's database lands.
- **First automated tests**: unit tests for the ingestion normalizer and API route logic (once Epic 05 exists), a couple of Playwright/equivalent end-to-end flows (login → change preference → refresh, ask Q&A → get answer, once Epic 03/04 exist).

## Acceptance Criteria

- [ ] A strict CSP is enforced with no violations in normal use.
- [ ] The regulation modal traps focus while open and restores it on close.
- [ ] There is a usable navigation path on mobile viewports.
- [ ] All dates are stored as ISO 8601 and formatted only at render time.
- [ ] At least one automated test exists and runs in a documented way.
